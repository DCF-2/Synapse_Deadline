package com.synapse.deadline.dto;

import java.time.LocalDate;

public class EngajamentoDiarioDTO {
    private LocalDate data;
    private long interacoes; // Soma de todos os engajamentos do dia

    public EngajamentoDiarioDTO(LocalDate data, long interacoes) {
        this.data = data;
        this.interacoes = interacoes;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public long getInteracoes() {
        return interacoes;
    }

    public void setInteracoes(long interacoes) {
        this.interacoes = interacoes;
    }
}
