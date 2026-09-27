package com.example.demo.service;

import com.example.demo.exception.TransactionNotFoundException;
import com.example.demo.model.Category;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.validation.TransactionValidator;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Every public method here takes the current user's id and every query is filtered by it.
 * Controllers must always pass SecurityUtils.getCurrentUserId() — never a client-supplied id —
 * so users can only ever see or modify their own data.
 */
@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    // ===== READ =====

    public List<Transaction> getAllForUser(Long userId) {
        return repository.findByUserId(userId);
    }

    // ===== ADD =====

    public Transaction add(Long userId, Transaction t) {

        TransactionValidator.validate(t);

        t.setId(null);
        t.setUserId(userId);

        if (t.getDate() == null) {
            t.setDate(LocalDate.now());
        }

        return repository.save(t);
    }

    // ===== DELETE =====

    public void delete(Long userId, Long id) {

        Transaction existing = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new TransactionNotFoundException(id));

        repository.delete(existing);
    }

    // ===== UPDATE =====

    public void update(Long userId, Long id, Transaction updated) {

        TransactionValidator.validate(updated);

        Transaction existing = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new TransactionNotFoundException(id));

        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
        existing.setDate(updated.getDate());

        repository.save(existing);
    }

    // ===== ALL-TIME TOTALS =====

    public BigDecimal getIncome(Long userId) {
        return sum(repository.findByUserIdAndType(userId, TransactionType.INCOME));
    }

    public BigDecimal getExpense(Long userId) {
        return sum(repository.findByUserIdAndType(userId, TransactionType.EXPENSE));
    }

    public BigDecimal getBalance(Long userId) {
        return getIncome(userId).subtract(getExpense(userId));
    }

    // ===== PERIOD TOTALS =====

    public BigDecimal getIncome(Long userId, LocalDate from, LocalDate to) {
        return sum(filterByPeriod(repository.findByUserIdAndType(userId, TransactionType.INCOME), from, to));
    }

    public BigDecimal getExpense(Long userId, LocalDate from, LocalDate to) {
        return sum(filterByPeriod(repository.findByUserIdAndType(userId, TransactionType.EXPENSE), from, to));
    }

    // ===== EXPENSES BY CATEGORY =====

    public Map<Category, BigDecimal> getExpensesByCategory(Long userId, LocalDate from, LocalDate to) {

        Map<Category, BigDecimal> result = new HashMap<>();

        filterByPeriod(repository.findByUserIdAndType(userId, TransactionType.EXPENSE), from, to)
                .forEach(t -> result.merge(t.getCategory(), t.getAmount(), BigDecimal::add));

        return result;
    }

    // ===== FILTER =====

    public List<Transaction> filter(
            Long userId,
            String title,
            Category category,
            TransactionType type,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            LocalDate from,
            LocalDate to
    ) {
        return repository.findByUserId(userId).stream()
                .filter(t ->
                        title == null ||
                                title.isBlank() ||
                                t.getTitle().toLowerCase().contains(title.toLowerCase())
                )
                .filter(t -> category == null || t.getCategory() == category)
                .filter(t -> type == null || t.getType() == type)
                .filter(t -> minAmount == null || t.getAmount().compareTo(minAmount) >= 0)
                .filter(t -> maxAmount == null || t.getAmount().compareTo(maxAmount) <= 0)
                .filter(t -> from == null || !t.getDate().isBefore(from))
                .filter(t -> to == null || !t.getDate().isAfter(to))
                .toList();
    }

    // ===== HELPERS =====

    private List<Transaction> filterByPeriod(List<Transaction> list, LocalDate from, LocalDate to) {
        return list.stream().filter(t -> isInPeriod(t, from, to)).toList();
    }

    private boolean isInPeriod(Transaction t, LocalDate from, LocalDate to) {

        if (t.getDate() == null) {
            return false;
        }

        boolean afterFrom = from == null || !t.getDate().isBefore(from);
        boolean beforeTo = to == null || !t.getDate().isAfter(to);

        return afterFrom && beforeTo;
    }

    private BigDecimal sum(List<Transaction> list) {
        return list.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
