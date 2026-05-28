package com.example.demo.service;

import com.example.demo.dto.BalanceResponse;
import org.springframework.stereotype.Service;

@Service
public class StatisticsService {

    private final TransactionService transactionService;

    public StatisticsService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    public BalanceResponse getStatistics() {

        double income = transactionService.getIncome();

        double expense = transactionService.getExpense();

        double balance = income - expense;

        return new BalanceResponse(balance, income, expense);
    }
}