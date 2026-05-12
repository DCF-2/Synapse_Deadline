package com.synapse.deadline.service;

import com.synapse.deadline.dto.EmpresaCadastroDTO;
import com.synapse.deadline.dto.EmpresaResponseDTO;
import com.synapse.deadline.entity.Empresa;
import com.synapse.deadline.repository.EmpresaRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class EmpresaServiceTest {

    @Mock
    private EmpresaRepository repository;

    @Mock // <-- FIX: Essencial para o Spring não se perder ao rodar o teste
    private PasswordEncoder passwordEncoder; 

    @InjectMocks
    private EmpresaService service;

    @Test
    void deveCadastrarEmpresa() {
        EmpresaCadastroDTO dto = new EmpresaCadastroDTO();
        dto.setNomeFantasia("Farmacia");
        dto.setRazaoSocial("Farmacia LTDA");
        dto.setCnpj("12.345.678/0001-99");
        dto.setEndereco("Rua A");
        dto.setEmailLogin("teste@email.com");
        dto.setSenha("123");

        // Simula que o banco não tem e-mail ou CNPJ duplicados
        when(repository.existsByEmailLogin(anyString())).thenReturn(false);
        when(repository.existsByCnpj(anyString())).thenReturn(false);

        // Simula o encriptador de senha
        when(passwordEncoder.encode(anyString())).thenReturn("senha_criptografada_mock");

        // Simula o save do banco de dados
        when(repository.save(any(Empresa.class))).thenAnswer(i -> i.getArgument(0));

        // <-- FIX: Agora esperamos o DTO seguro de resposta!
        EmpresaResponseDTO response = service.cadastrar(dto);

        assertNotNull(response);
        
        // <-- FIX: Em objetos 'record', os getters não usam a palavra "get"
        assertEquals("Farmacia", response.nomeFantasia());
        assertEquals("teste@email.com", response.emailLogin());

        // Verifica se os métodos foram realmente chamados nos bastidores
        verify(repository, times(1)).save(any(Empresa.class));
        verify(passwordEncoder, times(1)).encode("123");
    }
}