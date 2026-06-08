package com.example.demo.validation;

import com.example.demo.model.Transaction;

import java.math.BigDecimal;

public class TransactionValidator {

    public static void validate(Transaction t) {

        if (t.getTitle() == null ||
                t.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Title cannot be empty"
            );
        }

        if (t.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Amount must be greater than 0"
            );
        }
    }
}