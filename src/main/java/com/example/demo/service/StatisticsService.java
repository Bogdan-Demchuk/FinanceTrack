package com.example.demo.service;

import com.example.demo.dto.BalanceResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class StatisticsService {

    private final TransactionService transactionService;

    public StatisticsService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    public BalanceResponse getStatistics() {

        BigDecimal income = transactionService.getIncome();
        BigDecimal expense = transactionService.getExpense();

        BigDecimal balance = income.subtract(expense);

        return new BalanceResponse(income, expense, balance);
    }
}