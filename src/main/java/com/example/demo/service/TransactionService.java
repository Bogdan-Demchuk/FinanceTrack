package com.example.demo.service;

import com.example.demo.exception.TransactionNotFoundException;
import com.example.demo.model.Category;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.validation.TransactionValidator;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final List<Transaction> transactions = new ArrayList<>();
    private long idCounter = 1;

    public TransactionService() {

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Salary",
                        new BigDecimal("1000"),
                        TransactionType.INCOME,
                        Category.WORK,
                        LocalDate.now(),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Food",
                        new BigDecimal("50"),
                        TransactionType.EXPENSE,
                        Category.FOOD,
                        LocalDate.now(),
                        1L
                )
        );
    }

    // ===== GET ALL =====
    public List<Transaction> getAll() {
        return transactions;
    }

    // ===== GET BY USER =====
    public List<Transaction> getByUser(Long userId) {
        return transactions.stream()
                .filter(t -> t.getUserId() != null && t.getUserId().equals(userId))
                .toList();
    }

    // ===== ADD =====
    public void add(Transaction t) {

        TransactionValidator.validate(t);

        t.setId(idCounter++);

        // если userId не пришёл — ставим дефолт (чтобы не падало)
        if (t.getUserId() == null) {
            t.setUserId(1L);
        }

        transactions.add(t);
    }

    // ===== DELETE =====
    public void delete(Long id) {
        transactions.removeIf(t -> t.getId().equals(id));
    }

    // ===== UPDATE =====
    public void update(Long id, Transaction updated) {

        Transaction existing = transactions.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new TransactionNotFoundException(id));

        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
        existing.setDate(updated.getDate());
    }

    // ===== INCOME =====
    public BigDecimal getIncome() {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ===== EXPENSE =====
    public BigDecimal getExpense() {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ===== BALANCE =====
    public BigDecimal getBalance() {
        return getIncome().subtract(getExpense());
    }

    // ===== FILTER BY CATEGORY =====
    public List<Transaction> filterByCategory(Category category) {
        return transactions.stream()
                .filter(t -> t.getCategory() == category)
                .toList();
    }
}