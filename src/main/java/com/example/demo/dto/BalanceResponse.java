package com.example.demo.dto;

import java.math.BigDecimal;

public class BalanceResponse {

    private BigDecimal balance;
    private BigDecimal income;
    private BigDecimal expense;

    public BalanceResponse(BigDecimal income,
                           BigDecimal expense,
                           BigDecimal balance) {
        this.income = income;
        this.expense = expense;
        this.balance = balance;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public BigDecimal getExpense() {
        return expense;
    }
}