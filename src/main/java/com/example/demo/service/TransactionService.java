package com.example.demo.service;

import com.example.demo.exception.TransactionNotFoundException;
import com.example.demo.model.Transaction;
import com.example.demo.validation.TransactionValidator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final List<Transaction> transactions = new ArrayList<>();
    private long idCounter = 1;

    public TransactionService() {
        transactions.add(new Transaction(idCounter++, "Salary", 1000, "INCOME", "WORK", LocalDate.now()));
        transactions.add(new Transaction(idCounter++, "Food", 50, "EXPENSE", "FOOD", LocalDate.now()));
    }

    public List<Transaction> getAll() {
        return transactions;
    }

    public void add(Transaction t) {
        TransactionValidator.validate(t);
        t.setId(idCounter++);
        transactions.add(t);
    }

    public void delete(Long id) {
        transactions.removeIf(t -> t.getId().equals(id));
    }

    public void update(Long id, Transaction updated) {

        Transaction existing = transactions.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() ->
                        new TransactionNotFoundException(id));

        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
    }

    public double getIncome() {
        return transactions.stream()
                .filter(t -> t.getType().equals("INCOME"))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    public double getExpense() {
        return transactions.stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    public double getBalance() {
        return getIncome() - getExpense();
    }

    public List<Transaction> filterByCategory(String category) {
        return transactions.stream()
                .filter(t -> t.getCategory().equalsIgnoreCase(category))
                .toList();
    }
}