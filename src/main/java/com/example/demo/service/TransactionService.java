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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private final List<Transaction> transactions = new ArrayList<>();
    private long idCounter = 1;

    public TransactionService() {

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Salary",
                        new BigDecimal("2500"),
                        TransactionType.INCOME,
                        Category.WORK,
                        LocalDate.now().minusDays(25),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Freelance",
                        new BigDecimal("600"),
                        TransactionType.INCOME,
                        Category.WORK,
                        LocalDate.now().minusDays(15),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Bonus",
                        new BigDecimal("300"),
                        TransactionType.INCOME,
                        Category.WORK,
                        LocalDate.now().minusDays(5),
                        1L
                )
        );


        // =========================
        // FOOD
        // =========================

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Supermarket",
                        new BigDecimal("180"),
                        TransactionType.EXPENSE,
                        Category.FOOD,
                        LocalDate.now().minusDays(22),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Coffee",
                        new BigDecimal("45"),
                        TransactionType.EXPENSE,
                        Category.FOOD,
                        LocalDate.now().minusDays(18),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Restaurant",
                        new BigDecimal("120"),
                        TransactionType.EXPENSE,
                        Category.FOOD,
                        LocalDate.now().minusDays(10),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Pizza",
                        new BigDecimal("35"),
                        TransactionType.EXPENSE,
                        Category.FOOD,
                        LocalDate.now().minusDays(3),
                        1L
                )
        );


        // =========================
        // TRANSPORT
        // =========================

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Gas",
                        new BigDecimal("100"),
                        TransactionType.EXPENSE,
                        Category.TRANSPORT,
                        LocalDate.now().minusDays(20),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Taxi",
                        new BigDecimal("40"),
                        TransactionType.EXPENSE,
                        Category.TRANSPORT,
                        LocalDate.now().minusDays(8),
                        1L
                )
        );


        // =========================
        // SHOPPING
        // =========================

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Clothes",
                        new BigDecimal("150"),
                        TransactionType.EXPENSE,
                        Category.SHOPPING,
                        LocalDate.now().minusDays(17),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Headphones",
                        new BigDecimal("90"),
                        TransactionType.EXPENSE,
                        Category.SHOPPING,
                        LocalDate.now().minusDays(6),
                        1L
                )
        );


        // =========================
        // ENTERTAINMENT
        // =========================

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Cinema",
                        new BigDecimal("30"),
                        TransactionType.EXPENSE,
                        Category.ENTERTAINMENT,
                        LocalDate.now().minusDays(14),
                        1L
                )
        );

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Games",
                        new BigDecimal("60"),
                        TransactionType.EXPENSE,
                        Category.ENTERTAINMENT,
                        LocalDate.now().minusDays(4),
                        1L
                )
        );


        // =========================
        // HEALTH
        // =========================

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Pharmacy",
                        new BigDecimal("70"),
                        TransactionType.EXPENSE,
                        Category.HEALTH,
                        LocalDate.now().minusDays(12),
                        1L
                )
        );


        // =========================
        // OTHER
        // =========================

        transactions.add(
                new Transaction(
                        idCounter++,
                        "Gift",
                        new BigDecimal("50"),
                        TransactionType.EXPENSE,
                        Category.OTHER,
                        LocalDate.now().minusDays(7),
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

    public void delete(Long id) {

        boolean removed = transactions.removeIf(
                t -> t.getId().equals(id)
        );

        if (!removed) {
            throw new TransactionNotFoundException(id);
        }
    }

    // ===== UPDATE =====
    public void update(Long id, Transaction updated) {

        TransactionValidator.validate(updated);

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

    // Все доходы
    public BigDecimal getIncome() {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Доходы за период
    public BigDecimal getIncome(LocalDate from, LocalDate to) {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .filter(t -> isInPeriod(t, from, to))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Все расходы
    public BigDecimal getExpense() {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Расходы за период
    public BigDecimal getExpense(LocalDate from, LocalDate to) {
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> isInPeriod(t, from, to))
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
    public List<Transaction> filter(
            String title,
            Category category,
            TransactionType type,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            LocalDate from,
            LocalDate to
    ) {
        return transactions.stream()
                .filter(t ->
                        title == null ||
                                title.isBlank() ||
                                t.getTitle().toLowerCase()
                                        .contains(title.toLowerCase())
                )
                .filter(t ->
                        category == null ||
                                t.getCategory() == category
                )
                .filter(t ->
                        type == null ||
                                t.getType() == type
                )
                .filter(t ->
                        minAmount == null ||
                                t.getAmount().compareTo(minAmount) >= 0
                )
                .filter(t ->
                        maxAmount == null ||
                                t.getAmount().compareTo(maxAmount) <= 0
                )
                .filter(t ->
                        from == null ||
                                !t.getDate().isBefore(from)
                )
                .filter(t ->
                        to == null ||
                                !t.getDate().isAfter(to)
                )
                .toList();
    }
    private boolean isInPeriod(
            Transaction transaction,
            LocalDate from,
            LocalDate to
    ) {
        if (transaction.getDate() == null) {
            return false;
        }

        boolean afterFrom =
                from == null ||
                        !transaction.getDate().isBefore(from);

        boolean beforeTo =
                to == null ||
                        !transaction.getDate().isAfter(to);

        return afterFrom && beforeTo;
    }
    // ===== EXPENSES BY CATEGORY =====

    public Map<Category, BigDecimal> getExpensesByCategory(
            LocalDate from,
            LocalDate to
    ) {
        Map<Category, BigDecimal> result = new HashMap<>();

        transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> isInPeriod(t, from, to))
                .forEach(t -> {

                    Category category = t.getCategory();

                    result.merge(
                            category,
                            t.getAmount(),
                            BigDecimal::add
                    );
                });

        return result;
    }

}