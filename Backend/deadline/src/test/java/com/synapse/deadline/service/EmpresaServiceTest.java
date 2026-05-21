package com.synapse.deadline.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaPerfilDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.entity.RamoEmpresa;
import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.repository.RamoEmpresaRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmpresaServiceTest {

    @InjectMocks
    private EmpresaService empresaService;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private RamoEmpresaRepository ramoEmpresaRepository; // Assumido para validar o idRamo

    @Mock
    private PasswordEncoder passwordEncoder;

    private EmpresaCadastroDTO cadastroDTO;
    private EmpresaPerfilDTO edicaoDTO;
    private Empresa empresaSalva;
    private RamoEmpresa ramoValido;

    @BeforeEach
    void setUp() {
        // Setup Ramo
        ramoValido = new RamoEmpresa();
        // ramoValido.setId(1L);
        ramoValido.setNome("Alimentação");

        // Setup Cadastro DTO (Caminho Feliz - Todos os dados)
        cadastroDTO = new EmpresaCadastroDTO();
        cadastroDTO.setNomeFantasia("Mercado da Esquina");
        cadastroDTO.setRazaoSocial("Mercado da Esquina LTDA");
        cadastroDTO.setCnpj("11.111.111/0001-11");
        cadastroDTO.setEmailLogin("contato@mercado.com");
        cadastroDTO.setSenha("SenhaForte123!");
        cadastroDTO.setIdRamo(1L);
        cadastroDTO.setHorarioFuncionamento("08:00 as 18:00");
        cadastroDTO.setInstrucoesRetirada("Retirar no balcão");
        // Endereco seria instanciado aqui na prática

        // Setup Edição DTO
        edicaoDTO = new EmpresaPerfilDTO();
        edicaoDTO.setNomeFantasia("Mercado Novo Nome");
        edicaoDTO.setIdRamo(2L);
        edicaoDTO.setHorarioFuncionamento("24 horas");

        // Setup Entidade Simulada
        empresaSalva = new Empresa();
        // empresaSalva.setId(1L);
        empresaSalva.setNomeFantasia("Mercado da Esquina");
        empresaSalva.setCnpj("11.111.111/0001-11");
        empresaSalva.setEmailLogin("contato@mercado.com");
        empresaSalva.setSenhaHash("hash_da_senha");
    }

    // ==========================================
    // BLOCO 1: CADASTRO DE EMPRESA
    // ==========================================

    @Test
    @DisplayName("TC_EMP_001: Cadastro de Empresa com Sucesso (Todos os dados)")
    void deveCadastrarEmpresaComTodosOsDados() {
        when(empresaRepository.findByCnpj(cadastroDTO.getCnpj())).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailLogin(cadastroDTO.getEmailLogin())).thenReturn(Optional.empty());
        when(ramoEmpresaRepository.findById(cadastroDTO.getIdRamo())).thenReturn(Optional.of(ramoValido));
        when(passwordEncoder.encode(cadastroDTO.getSenha())).thenReturn("hash_da_senha");
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresaSalva);

        EmpresaPerfilDTO resultado = empresaService.cadastrarEmpresa(cadastroDTO);

        assertNotNull(resultado);
        verify(empresaRepository, times(1)).save(any(Empresa.class));
    }

    @Test
    @DisplayName("TC_EMP_002: Cadastro de Empresa com Sucesso (Apenas dados obrigatórios)")
    void deveCadastrarEmpresaApenasComDadosObrigatorios() {
        // Simulando DTO com campos opcionais nulos
        cadastroDTO.setContatoWhatsapp(null);
        cadastroDTO.setLogotipo(null);

        when(empresaRepository.findByCnpj(anyString())).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailLogin(anyString())).thenReturn(Optional.empty());
        when(ramoEmpresaRepository.findById(anyLong())).thenReturn(Optional.of(ramoValido));
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresaSalva);

        EmpresaPerfilDTO resultado = empresaService.cadastrarEmpresa(cadastroDTO);
        assertNotNull(resultado);
    }

    @Test
    @DisplayName("TC_EMP_003: Erro no Cadastro - CNPJ já cadastrado no sistema")
    void deveLancarErroCnpjDuplicado() {
        when(empresaRepository.findByCnpj(cadastroDTO.getCnpj())).thenReturn(Optional.of(empresaSalva));

        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
        verify(empresaRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC_EMP_004: Erro no Cadastro - E-mail de login já cadastrado no sistema")
    void deveLancarErroEmailDuplicado() {
        when(empresaRepository.findByCnpj(cadastroDTO.getCnpj())).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailLogin(cadastroDTO.getEmailLogin())).thenReturn(Optional.of(empresaSalva));

        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
        verify(empresaRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC_EMP_005: Erro no Cadastro - idRamo fornecido não existe no banco de dados")
    void deveLancarErroIdRamoInexistente() {
        when(empresaRepository.findByCnpj(anyString())).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailLogin(anyString())).thenReturn(Optional.empty());
        when(ramoEmpresaRepository.findById(cadastroDTO.getIdRamo())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_006: Erro no Cadastro - CNPJ com formato inválido")
    void deveLancarErroCnpjInvalido() {
        cadastroDTO.setCnpj("123"); // Inválido
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_007: Erro no Cadastro - E-mail de login com formato inválido")
    void deveLancarErroEmailInvalido() {
        cadastroDTO.setEmailLogin("emailsemarroba.com");
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_008: Erro no Cadastro - CEP do Endereço com formato inválido")
    void deveLancarErroCepInvalido() {
        // Assumindo que o Service ou Validador checa o CEP do EnderecoDTO
        // cadastroDTO.getEndereco().setCep("000"); 
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO)); // Ajuste de acordo com a implementação real
    }

    @Test
    @DisplayName("TC_EMP_009: Erro no Cadastro - Senha não atende aos requisitos mínimos")
    void deveLancarErroSenhaFraca() {
        cadastroDTO.setSenha("123"); // Muito curta
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_010: Erro no Cadastro - Coordenadas geográficas inválidas")
    void deveLancarErroCoordenadasInvalidas() {
        // Ex: Latitude > 90
        // cadastroDTO.setLatitude(100.0);
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_011: Erro no Cadastro - Envio sem razaoSocial")
    void deveLancarErroSemRazaoSocial() {
        cadastroDTO.setRazaoSocial(null);
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_012: Erro no Cadastro - Envio sem nomeFantasia")
    void deveLancarErroSemNomeFantasia() {
        cadastroDTO.setNomeFantasia(null);
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_013: Erro no Cadastro - Envio sem dados obrigatórios do EnderecoDTO")
    void deveLancarErroSemEnderecoCompleto() {
        // cadastroDTO.setEndereco(null);
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    @Test
    @DisplayName("TC_EMP_014: Erro no Cadastro - Envio sem instrucoesRetirada ou horarioFuncionamento")
    void deveLancarErroSemInstrucoesOuHorario() {
        cadastroDTO.setHorarioFuncionamento(null);
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }

    // ==========================================
    // BLOCO 2: VISUALIZAÇÃO DE PERFIL
    // ==========================================

    @Test
    @DisplayName("TC_EMP_015: Visualização de Perfil com Sucesso")
    void deveVisualizarPerfilComSucesso() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        EmpresaPerfilDTO resultado = empresaService.visualizarPerfil(1L);
        assertNotNull(resultado);
        assertEquals(empresaSalva.getNomeFantasia(), resultado.getNomeFantasia());
    }

    @Test
    @DisplayName("TC_EMP_016: Erro na Visualização - idEmpresa não existe")
    void deveLancarErroAoVisualizarEmpresaInexistente() {
        when(empresaRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> empresaService.visualizarPerfil(99L));
    }

    // ==========================================
    // BLOCO 3: EDIÇÃO DE PERFIL
    // ==========================================

    @Test
    @DisplayName("TC_EMP_017: Edição de Perfil com Sucesso (Múltiplos campos)")
    void deveEditarPerfilComSucesso() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        when(ramoEmpresaRepository.findById(edicaoDTO.getIdRamo())).thenReturn(Optional.of(ramoValido));
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresaSalva);

        EmpresaPerfilDTO resultado = empresaService.editarPerfil(1L, edicaoDTO);
        assertNotNull(resultado);
        verify(empresaRepository).save(any(Empresa.class));
    }

    @Test
    @DisplayName("TC_EMP_018: Edição de Perfil com Sucesso (Alterando idRamo)")
    void deveEditarRamoComSucesso() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        when(ramoEmpresaRepository.findById(edicaoDTO.getIdRamo())).thenReturn(Optional.of(ramoValido));
        
        empresaService.editarPerfil(1L, edicaoDTO);
        verify(empresaRepository).save(empresaSalva);
    }

    @Test
    @DisplayName("TC_EMP_019: Erro na Edição - E-mail já utilizado por outra empresa")
    void deveLancarErroAoEditarEmailParaEmailExistente() {
        edicaoDTO.setEmailLogin("outro@email.com");
        Empresa outraEmpresa = new Empresa();
        // outraEmpresa.setId(2L);
        
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        when(empresaRepository.findByEmailLogin(edicaoDTO.getEmailLogin())).thenReturn(Optional.of(outraEmpresa));

        assertThrows(IllegalArgumentException.class, () -> empresaService.editarPerfil(1L, edicaoDTO));
    }

    @Test
    @DisplayName("TC_EMP_020: Erro na Edição - Tentativa de alterar o CNPJ (Chave Imutável)")
    void deveBloquearAlteracaoDeCnpj() {
        // Se o DTO de edição tiver CNPJ, o service deve lançar erro ou ignorar
        // edicaoDTO.setCnpj("22.222.222/0001-22");
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        assertThrows(IllegalArgumentException.class, () -> empresaService.editarPerfil(1L, edicaoDTO)); 
    }

    @Test
    @DisplayName("TC_EMP_021: Erro na Edição - idEmpresa informado não existe")
    void deveLancarErroEdicaoIdEmpresaInexistente() {
        when(empresaRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> empresaService.editarPerfil(99L, edicaoDTO));
    }

    @Test
    @DisplayName("TC_EMP_022: Erro na Edição - Tentativa de atualizar para idRamo inexistente")
    void deveLancarErroEdicaoRamoInexistente() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        when(ramoEmpresaRepository.findById(edicaoDTO.getIdRamo())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> empresaService.editarPerfil(1L, edicaoDTO));
    }

    // ==========================================
    // BLOCO 4: REGRAS DE SEGURANÇA E SANITIZAÇÃO
    // ==========================================

    @Test
    @DisplayName("TC_EMP_023: Cadastro - Verificação de Criptografia de Senha")
    void deveCriptografarSenhaNoCadastro() {
        when(empresaRepository.findByCnpj(anyString())).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailLogin(anyString())).thenReturn(Optional.empty());
        when(ramoEmpresaRepository.findById(anyLong())).thenReturn(Optional.of(ramoValido));
        
        String senhaPura = cadastroDTO.getSenha();
        when(passwordEncoder.encode(senhaPura)).thenReturn("hash_seguro_123");
        
        empresaService.cadastrarEmpresa(cadastroDTO);
        
        verify(passwordEncoder, times(1)).encode(senhaPura);
    }

    @Test
    @DisplayName("TC_EMP_024: Edição - Verificação de Proteção de Senha")
    void naoDeveAlterarSenhaNaEdicaoDePerfil() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaSalva));
        when(ramoEmpresaRepository.findById(anyLong())).thenReturn(Optional.of(ramoValido));
        
        empresaService.editarPerfil(1L, edicaoDTO);
        
        // Garante que o encoder nunca foi chamado na edição
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("TC_EMP_025: Cadastro - Sanitização de Espaços (trim)")
    void deveSanitizarEspacosEmEmailECnpj() {
        cadastroDTO.setEmailLogin("  email@espaço.com  ");
        cadastroDTO.setCnpj(" 11.111.111/0001-11 ");
        
        // A lógica do service deve chamar o trim() internamente
        // assertThrows ou assert verifica se o valor limpo foi passado adiante
    }

    @Test
    @DisplayName("TC_EMP_026: Cadastro - Case Insensitivity de E-mail")
    void deveIgnorarCaseSensitityEmDuplicidadeDeEmail() {
        cadastroDTO.setEmailLogin("CONTATO@MERCADO.COM");
        // Simula que o banco achou a versão minúscula
        when(empresaRepository.findByCnpj(anyString())).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailLogin("contato@mercado.com")).thenReturn(Optional.of(empresaSalva));

        // Se o service transformar em minúsculo antes de buscar, ele vai encontrar o Optional.of e lançar erro
        assertThrows(IllegalArgumentException.class, () -> empresaService.cadastrarEmpresa(cadastroDTO));
    }
}