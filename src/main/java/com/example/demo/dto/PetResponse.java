package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

public record PetResponse(
        BigDecimal balance,
        int stage,
        String clothing,
        String hat,
        List<PetItem> items
) {
}
