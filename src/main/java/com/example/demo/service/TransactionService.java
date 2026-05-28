package com.example.demo.service;

import com.example.demo.model.Transaction;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final List<Transaction> transactions = new ArrayList<>();

    public TransactionService() {
        transactions.add(new Transaction(1L, "Salary", 1000, "INCOME", LocalDate.now()));
        transactions.add(new Transaction(2L, "Food", -50, "EXPENSE", LocalDate.now()));
    }

    public List<Transaction> getAll() {
        return transactions;
    }

    public void add(Transaction transaction) {
        transactions.add(transaction);
    }
}