#!/usr/bin/env bash
# =============================================================================
# Synapse Deadline — ambiente local de testes e desenvolvimento
#
# Uso rápido:
#   ./scripts/dev-local.sh                 # testes + sobe tudo + seed + valida API/Maps
#   ./scripts/dev-local.sh start           # só sobe backend + frontend
#   ./scripts/dev-local.sh stop            # para tudo
#   ./scripts/dev-local.sh restart         # reinicia
#   ./scripts/dev-local.sh test            # testes Maven
#   ./scripts/dev-local.sh api             # smoke tests da API (geo 100 km)
#   ./scripts/dev-local.sh maps            # testa chaves Google Maps
#   ./scripts/dev-local.sh seed --force    # recria ofertas demo mesmo se já existirem
#   ./scripts/dev-local.sh status          # mostra o que está rodando
#   ./scripts/dev-local.sh --skip-tests    # pula mvn test
#
# URLs:
#   Frontend:   http://localhost:5173
#   Backend:    http://localhost:8080
#   Swagger:    http://localhost:8080/swagger-ui/index.html
#   H2 Console: http://localhost:8080/h2-console  (JDBC: jdbc:h2:file:./data/empresa-db)
#
# Nota: erro "gcm_client ... Authentication Failed: wrong_secret" no Chromium
#       é do navegador (sync Google), NÃO do projeto Deadline.
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/Backend/deadline"
FRONTEND_DIR="$ROOT_DIR/Frontend/deadline"
STATE_DIR="$ROOT_DIR/.dev-local"
BACKEND_PID_FILE="$STATE_DIR/backend.pid"
FRONTEND_PID_FILE="$STATE_DIR/frontend.pid"
BACKEND_LOG="$STATE_DIR/backend.log"
FRONTEND_LOG="$STATE_DIR/frontend.log"
SEED_MARKER="$STATE_DIR/seed.ok"

API_URL="${API_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

SKIP_TESTS=false
FORCE_SEED=false
CMD="all"

# Centro de Recife — ponto de referência para testes de proximidade
LAT_EXEMPLO="-8.0476"
LNG_EXEMPLO="-34.8770"

for arg in "$@"; do
  case "$arg" in
    --skip-tests) SKIP_TESTS=true ;;
    --force) FORCE_SEED=true ;;
    test|start|stop|restart|api|maps|seed|status|all) CMD="$arg" ;;
    *)
      echo "Argumento desconhecido: $arg"
      echo "Uso: $0 [test|start|stop|restart|api|maps|seed|status|all] [--skip-tests]"
      exit 1
      ;;
  esac
done

info()  { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m    $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m  $*"; }
fail()  { echo -e "\033[1;31m[ERRO]\033[0m  $*" >&2; exit 1; }

mkdir -p "$STATE_DIR"

# ---------------------------------------------------------------------------
# Pré-requisitos
# ---------------------------------------------------------------------------

verificar_java() {
  command -v java >/dev/null 2>&1 || fail "Java não encontrado. Instale OpenJDK 17."
  local versao
  versao="$(java -version 2>&1 | head -1 | grep -oE '[0-9]+' | head -1)"
  [[ -n "$versao" && "$versao" -ge 17 ]] || fail "Java ${versao:-?} detectado. Requer Java 17+."
  ok "Java $(java -version 2>&1 | head -1)"
}

verificar_maven() {
  command -v mvn >/dev/null 2>&1 || fail "Maven não encontrado."
  ok "Maven $(mvn -version 2>&1 | head -1)"
}

verificar_node() {
  command -v node >/dev/null 2>&1 || fail "Node.js não encontrado."
  command -v npm  >/dev/null 2>&1 || fail "npm não encontrado."
  ok "Node $(node -v) / npm $(npm -v)"
}

verificar_curl() {
  command -v curl >/dev/null 2>&1 || fail "curl não encontrado."
}

verificar_python() {
  command -v python3 >/dev/null 2>&1 || fail "python3 não encontrado (necessário para seed e parse JSON)."
}

# ---------------------------------------------------------------------------
# .env
# ---------------------------------------------------------------------------

carregar_env_backend() {
  local env_file="$BACKEND_DIR/.env"
  [[ -f "$env_file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source <(grep -v '^#' "$env_file" | grep -v '^$' | sed 's/^/export /')
  set +a
}

preparar_env_backend() {
  local env_file="$BACKEND_DIR/.env"
  if [[ -f "$env_file" ]]; then
    info "Backend .env encontrado."
    carregar_env_backend
    return
  fi

  info "Criando $env_file com valores de desenvolvimento..."
  cat > "$env_file" <<'EOF'
JWT_SECRET=dev_jwt_secret_local_synapse_deadline_123456789
H2_CONSOLE_ENABLED=true
GOOGLE_MAPS_GEOCODING_API_KEY=
GOOGLE_MAPS_DISTANCE_API_KEY=
EOF
  warn "Chaves Google Maps vazias — edite Backend/deadline/.env"
  carregar_env_backend
}

preparar_env_frontend() {
  local env_file="$FRONTEND_DIR/.env"
  [[ -f "$env_file" ]] && return
  info "Criando $env_file..."
  cat > "$env_file" <<EOF
VITE_API_URL=${API_URL}
EOF
}

# ---------------------------------------------------------------------------
# Processos / portas
# ---------------------------------------------------------------------------

porta_em_uso() {
  local porta="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -tln | grep -q ":${porta} "
  elif command -v lsof >/dev/null 2>&1; then
    lsof -i:"$porta" -sTCP:LISTEN >/dev/null 2>&1
  else
    curl -sf "http://localhost:${porta}" >/dev/null 2>&1
  fi
}

matar_porta() {
  local porta="$1"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${porta}/tcp" >/dev/null 2>&1 || true
  elif command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti:"${porta}" 2>/dev/null || true)"
    [[ -n "$pids" ]] && kill -9 $pids 2>/dev/null || true
  fi
}

processo_ativo() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] || return 1
  kill -0 "$(cat "$pid_file")" 2>/dev/null
}

parar_processo() {
  local nome="$1"
  local pid_file="$2"
  local porta="$3"

  if processo_ativo "$pid_file"; then
    local pid
    pid="$(cat "$pid_file")"
    info "Encerrando $nome (PID $pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 2
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$pid_file"
  matar_porta "$porta"
}

parar_tudo() {
  parar_processo "backend"  "$BACKEND_PID_FILE" "$BACKEND_PORT"
  parar_processo "frontend" "$FRONTEND_PID_FILE" "$FRONTEND_PORT"
  sleep 1
}

aguardar_backend() {
  info "Aguardando backend em $API_URL ..."
  for _ in $(seq 1 90); do
    if curl -sf "$API_URL/categoria" >/dev/null 2>&1; then
      ok "Backend respondendo."
      return 0
    fi
    if ! processo_ativo "$BACKEND_PID_FILE" && ! porta_em_uso "$BACKEND_PORT"; then
      tail -20 "$BACKEND_LOG" 2>/dev/null || true
      fail "Backend encerrou inesperadamente. Veja: $BACKEND_LOG"
    fi
    sleep 2
  done
  tail -30 "$BACKEND_LOG" 2>/dev/null || true
  fail "Backend não subiu a tempo. Veja: $BACKEND_LOG"
}

aguardar_frontend() {
  info "Aguardando frontend em $FRONTEND_URL ..."
  for _ in $(seq 1 45); do
    if curl -sf "$FRONTEND_URL" >/dev/null 2>&1; then
      ok "Frontend respondendo."
      return 0
    fi
    sleep 2
  done
  warn "Frontend ainda compilando — veja: $FRONTEND_LOG"
}

# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------

cmd_status() {
  echo "============================================"
  echo " Synapse Deadline — status local"
  echo "============================================"
  if porta_em_uso "$BACKEND_PORT"; then
    ok "Backend  : rodando → $API_URL"
  else
    warn "Backend  : parado"
  fi
  if porta_em_uso "$FRONTEND_PORT"; then
    ok "Frontend : rodando → $FRONTEND_URL"
  else
    warn "Frontend : parado"
  fi
  if [[ -f "$BACKEND_DIR/.env" ]]; then
    carregar_env_backend
    [[ -n "${GOOGLE_MAPS_GEOCODING_API_KEY:-}" ]] && ok "Geocoding key : configurada" || warn "Geocoding key : vazia"
    [[ -n "${GOOGLE_MAPS_DISTANCE_API_KEY:-}" ]] && ok "Distance key  : configurada" || warn "Distance key  : vazia"
  else
    warn "Backend .env : não existe"
  fi
  [[ -f "$SEED_MARKER" ]] && ok "Seed demo    : já executado" || info "Seed demo    : ainda não executado (./scripts/dev-local.sh seed)"
  echo "============================================"
}

cmd_test() {
  verificar_java
  verificar_maven
  info "Rodando testes Maven (Java 17)..."
  cd "$BACKEND_DIR"
  mvn test -q
  ok "44+ testes passaram (BUILD SUCCESS)."
}

cmd_start_backend() {
  if porta_em_uso "$BACKEND_PORT"; then
    warn "Porta $BACKEND_PORT já em uso — backend provavelmente rodando."
    return
  fi

  preparar_env_backend
  : > "$BACKEND_LOG"
  info "Iniciando backend Spring Boot..."
  cd "$BACKEND_DIR"
  nohup mvn spring-boot:run -q >>"$BACKEND_LOG" 2>&1 &
  echo $! > "$BACKEND_PID_FILE"
  info "Backend PID $(cat "$BACKEND_PID_FILE") — log: $BACKEND_LOG"
  aguardar_backend
  # GeoMigrationRunner roda na subida — dar tempo para geocodificar lojas antigas
  sleep 2
}

cmd_start_frontend() {
  if porta_em_uso "$FRONTEND_PORT"; then
    warn "Porta $FRONTEND_PORT já em uso — frontend provavelmente rodando."
    return
  fi

  verificar_node
  preparar_env_frontend

  if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    info "Instalando dependências do frontend (primeira vez)..."
    cd "$FRONTEND_DIR"
    npm install --silent
  fi

  : > "$FRONTEND_LOG"
  info "Iniciando frontend Vite..."
  cd "$FRONTEND_DIR"
  nohup npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" >>"$FRONTEND_LOG" 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
  info "Frontend PID $(cat "$FRONTEND_PID_FILE") — log: $FRONTEND_LOG"
  aguardar_frontend
}

cmd_start() {
  verificar_java
  verificar_maven
  cmd_start_backend
  cmd_start_frontend
  imprimir_resumo
}

cmd_restart() {
  info "Reiniciando ambiente..."
  parar_tudo
  sleep 2
  SKIP_TESTS=true
  cmd_start
}

imprimir_resumo() {
  echo ""
  echo "============================================"
  ok "Ambiente local pronto!"
  echo "============================================"
  echo "  Frontend:   $FRONTEND_URL"
  echo "  Backend:    $API_URL"
  echo "  Swagger:    $API_URL/swagger-ui/index.html"
  echo "  H2 Console: $API_URL/h2-console"
  echo ""
  echo "  Comandos úteis:"
  echo "    ./scripts/dev-local.sh seed     # dados demo (lojas + ofertas)"
  echo "    ./scripts/dev-local.sh maps     # testar chaves Google Maps"
  echo "    ./scripts/dev-local.sh api      # testar geolocalização"
  echo "    ./scripts/dev-local.sh status   # ver status"
  echo "    ./scripts/dev-local.sh stop     # parar tudo"
  echo ""
  echo "  Logs:"
  echo "    tail -f $BACKEND_LOG"
  echo "    tail -f $FRONTEND_LOG"
  echo "============================================"
}

cmd_maps() {
  verificar_curl
  preparar_env_backend

  local geo_key="${GOOGLE_MAPS_GEOCODING_API_KEY:-}"
  local dist_key="${GOOGLE_MAPS_DISTANCE_API_KEY:-}"

  echo ""
  info "Verificando Google Maps API keys..."
  echo ""

  if [[ -z "$geo_key" ]]; then
    warn "GOOGLE_MAPS_GEOCODING_API_KEY vazia — geocodificação desabilitada."
  else
    local geo_resp geo_status
    geo_resp="$(curl -s "https://maps.googleapis.com/maps/api/geocode/json?address=Recife,PE,Brasil&key=${geo_key}&region=br")"
    geo_status="$(python3 -c "import json,sys; print(json.load(sys.stdin).get('status','?'))" <<< "$geo_resp")"
    if [[ "$geo_status" == "OK" ]]; then
      ok "Geocoding API: OK"
    else
      warn "Geocoding API: status=$geo_status"
      echo "       Resposta: $(python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('error_message',d))" <<< "$geo_resp" 2>/dev/null || echo "$geo_resp")"
    fi
  fi

  if [[ -z "$dist_key" ]]; then
    warn "GOOGLE_MAPS_DISTANCE_API_KEY vazia — distância rodoviária usará fallback."
  else
    local dist_resp dist_status
    dist_resp="$(curl -s "https://maps.googleapis.com/maps/api/distancematrix/json?origins=${LAT_EXEMPLO},${LNG_EXEMPLO}&destinations=-8.0500,-34.8800&mode=driving&language=pt-BR&key=${dist_key}")"
    dist_status="$(python3 -c "import json,sys; print(json.load(sys.stdin).get('status','?'))" <<< "$dist_resp")"
    if [[ "$dist_status" == "OK" ]]; then
      local km
      km="$(python3 -c "import json,sys; d=json.load(sys.stdin); e=d['rows'][0]['elements'][0]; print(round(e['distance']['value']/1000,1) if e.get('status')=='OK' else 'N/A')" <<< "$dist_resp")"
      ok "Distance Matrix API: OK (Recife centro → Boa Viagem ≈ ${km} km de carro)"
    else
      warn "Distance Matrix API: status=$dist_status"
      echo "       Resposta: $(python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('error_message',d))" <<< "$dist_resp" 2>/dev/null || echo "$dist_resp")"
    fi
  fi
  echo ""
}

cmd_seed() {
  verificar_curl
  verificar_python

  if ! curl -sf "$API_URL/categoria" >/dev/null 2>&1; then
    fail "Backend não está no ar. Rode: ./scripts/dev-local.sh start"
  fi

  local total_atual lojas_file="$ROOT_DIR/scripts/demo-lojas.tsv"
  total_atual="$(curl -s "$API_URL/oferta/publico?size=1" | python3 -c "import json,sys; print(json.load(sys.stdin).get('totalElements',0))")"

  if [[ "$total_atual" -gt 0 && -f "$SEED_MARKER" && "$FORCE_SEED" != true ]]; then
    ok "Já existem $total_atual oferta(s) — seed ignorado."
    info "Para adicionar as 15 lojas demo: ./scripts/dev-local.sh seed --force"
    info "Para recriar do zero: rm -rf Backend/deadline/data/ .dev-local/seed.ok && ./scripts/dev-local.sh seed"
    return
  fi

  [[ -f "$lojas_file" ]] || fail "Arquivo não encontrado: $lojas_file"

  info "Criando lojas demo em várias cidades (dados em scripts/demo-lojas.tsv)..."

  local ramo_id cat_id
  ramo_id="$(curl -s "$API_URL/empresa/ramo/publico" | python3 -c "import json,sys; r=json.load(sys.stdin); print(r[0]['id'] if r else '')")"
  cat_id="$(curl -s "$API_URL/categoria" | python3 -c "import json,sys; r=json.load(sys.stdin); print(next((c['id'] for c in r if 'medicament' in c.get('nome','').lower() or c.get('slug')=='medicamentos'), r[0]['id'] if r else ''))")"

  [[ -n "$ramo_id" && -n "$cat_id" ]] || fail "Não foi possível obter ramo/categoria do backend."

  local validade fim_oferta criadas=0 falhas=0
  validade="$(python3 -c "from datetime import date,timedelta; print((date.today()+timedelta(days=20)).isoformat())")"
  fim_oferta="$(python3 -c "from datetime import date,timedelta; print((date.today()+timedelta(days=45)).isoformat())")"

  criar_loja_com_oferta() {
    local suffix="$1" email="$2" cnpj="$3" nome="$4" logradouro="$5" numero="$6" bairro="$7" cep="$8" cidade="$9" uf="${10}" produto="${11}" preco_orig="${12}" preco_promo="${13}"

    info "[$suffix] $nome — $cidade/$uf"

    local cadastro_http
    cadastro_http="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API_URL/empresa/cadastro" \
      -H "Content-Type: application/json" \
      -d "{
        \"nomeFantasia\": \"$nome\",
        \"razaoSocial\": \"$nome LTDA\",
        \"cnpj\": \"$cnpj\",
        \"idRamo\": $ramo_id,
        \"endereco\": {
          \"logradouro\": \"$logradouro\",
          \"numero\": \"$numero\",
          \"bairro\": \"$bairro\",
          \"cep\": \"$cep\",
          \"cidade\": \"$cidade\",
          \"uf\": \"$uf\"
        },
        \"emailLogin\": \"$email\",
        \"senha\": \"Demo@123456\",
        \"instrucoesRetirada\": \"Retirar no balcão com documento.\",
        \"horarioFuncionamento\": \"08:00-20:00\",
        \"contatoWhatsapp\": \"8199999${suffix}\"
      }")"

    if [[ "$cadastro_http" != "201" && "$cadastro_http" != "200" ]]; then
      [[ "$cadastro_http" == "400" ]] && warn "  cadastro já existe, fazendo login..."
    fi

    local token prod_id oferta_http
    token="$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"emailLogin\":\"$email\",\"senha\":\"Demo@123456\"}" \
      | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))")"

    if [[ -z "$token" ]]; then
      warn "  login falhou para $email"
      falhas=$((falhas + 1))
      return 1
    fi

    prod_id="$(curl -s -X POST "$API_URL/produto" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "{
        \"tituloProduto\": \"$produto\",
        \"codBarrasEan\": \"789${suffix}1234567\",
        \"idCategoria\": $cat_id,
        \"descricao\": \"Produto demo — teste de geolocalização ($cidade/$uf).\",
        \"precoOriginal\": $preco_orig,
        \"ativo\": true
      }" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))")"

    if [[ -z "$prod_id" ]]; then
      warn "  produto não criado (EAN duplicado?)"
      falhas=$((falhas + 1))
      return 1
    fi

    oferta_http="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API_URL/oferta" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "{
        \"produtoId\": $prod_id,
        \"validadeProduto\": \"$validade\",
        \"dataFimOferta\": \"$fim_oferta\",
        \"precoPromocional\": $preco_promo,
        \"percentualDesconto\": 50.0,
        \"ativo\": true
      }")"

    if [[ "$oferta_http" == "200" ]]; then
      ok "  oferta criada — $produto"
      criadas=$((criadas + 1))
    else
      warn "  oferta HTTP $oferta_http"
      falhas=$((falhas + 1))
    fi

    sleep 0.3
  }

  while IFS='|' read -r suffix email cnpj nome logradouro numero bairro cep cidade uf produto preco_orig preco_promo; do
    [[ "$suffix" =~ ^#.*$ || -z "$suffix" ]] && continue
    [[ "$suffix" == "suffix" ]] && continue
    criar_loja_com_oferta "$suffix" "$email" "$cnpj" "$nome" "$logradouro" "$numero" "$bairro" "$cep" "$cidade" "$uf" "$produto" "$preco_orig" "$preco_promo" || true
  done < "$lojas_file"

  touch "$SEED_MARKER"
  echo ""
  ok "Seed concluído: $criadas oferta(s) criada(s), $falhas falha(s)."
  info "Login demo (qualquer loja): senha Demo@123456"
  info "Ex.: farmacia-recife-dev@test.local"
}

cmd_api() {
  verificar_curl
  verificar_python

  if ! curl -sf "$API_URL/categoria" >/dev/null 2>&1; then
    fail "Backend não está no ar. Rode: ./scripts/dev-local.sh start"
  fi

  echo ""
  info "=== Smoke tests da API ==="
  echo ""

  local status resposta total

  info "GET /categoria"
  status="$(curl -s -o /dev/null -w '%{http_code}' "$API_URL/categoria")"
  [[ "$status" == "200" ]] && ok "HTTP $status" || fail "HTTP $status"

  info "GET /oferta/publico"
  status="$(curl -s -o /dev/null -w '%{http_code}' "$API_URL/oferta/publico?size=5")"
  [[ "$status" == "200" ]] && ok "HTTP $status" || fail "HTTP $status"

  info "GET /oferta/publico + geo (100 km, ordenado por proximidade)"
  resposta="$(curl -s "$API_URL/oferta/publico?latitude=${LAT_EXEMPLO}&longitude=${LNG_EXEMPLO}&distanciaMaxKm=100&sort=distanciaKm,asc&size=10")"

  echo "$resposta" | python3 -c "import json,sys; json.load(sys.stdin)" >/dev/null 2>&1 \
    && ok "JSON válido" || fail "Resposta inválida"

  total="$(echo "$resposta" | python3 -c "import json,sys; print(json.load(sys.stdin).get('totalElements',0))")"
  info "Ofertas dentro de 100 km: $total"

  if [[ "$total" -gt 0 ]]; then
    echo ""
    info "Ranking por distância de carro:"
    echo "$resposta" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for o in data.get('content', []):
    d = o.get('distanciaKm')
    dtxt = f'{d} km' if d is not None else 'sem GPS'
    print(f\"  • {o.get('tituloProduto')} @ {o.get('nomeFantasiaEmpresa')} — {dtxt}\")
"
    ok "Geolocalização funcionando."
  else
    warn "Nenhuma oferta — rode: ./scripts/dev-local.sh seed"
  fi

  echo ""
  ok "Testes de API concluídos."
  echo "  Abra no navegador: http://localhost:5173"
  echo "  (Use localhost, não IP da rede — GPS bloqueia em HTTP externo)"
}

cmd_all() {
  verificar_curl

  if [[ "$SKIP_TESTS" == false ]]; then
    cmd_test
    echo ""
  else
    warn "Testes Maven pulados (--skip-tests)."
  fi

  cmd_start
  echo ""
  cmd_maps
  echo ""
  cmd_seed
  echo ""
  cmd_api
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

case "$CMD" in
  test)    cmd_test ;;
  start)   cmd_start ;;
  stop)    parar_tudo; ok "Ambiente encerrado." ;;
  restart) cmd_restart ;;
  api)     cmd_api ;;
  maps)    cmd_maps ;;
  seed)    cmd_seed ;;
  status)  cmd_status ;;
  all)     cmd_all ;;
esac
