package com.example.demo.service;
import com.example.demo.dto.CategoryStatisticsResponse;
import com.example.demo.dto.DashboardResponse;
import com.example.demo.model.Category;

import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.demo.dto.BalanceResponse;
import com.example.demo.dto.PeriodStatisticsResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class StatisticsService {

    private final TransactionService transactionService;

    public StatisticsService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // ===== ALL TIME STATISTICS =====

    public BalanceResponse getStatistics() {

        BigDecimal income =
                transactionService.getIncome();

        BigDecimal expense =
                transactionService.getExpense();

        BigDecimal balance =
                income.subtract(expense);

        return new BalanceResponse(
                income,
                expense,
                balance
        );
    }

    // ===== PERIOD STATISTICS =====

    public PeriodStatisticsResponse getPeriodStatistics(
            LocalDate from,
            LocalDate to
    ) {

        BigDecimal income =
                transactionService.getIncome(from, to);

        BigDecimal expense =
                transactionService.getExpense(from, to);

        return new PeriodStatisticsResponse(
                income,
                expense
        );
    }
    // ===== CATEGORY STATISTICS =====

    public List<CategoryStatisticsResponse> getCategoryStatistics(
            LocalDate from,
            LocalDate to
    ) {
        BigDecimal income =
                transactionService.getIncome(from, to);

        BigDecimal expense =
                transactionService.getExpense(from, to);

        Map<Category, BigDecimal> expensesByCategory =
                transactionService.getExpensesByCategory(from, to);

        List<CategoryStatisticsResponse> result =
                new ArrayList<>();

        for (Map.Entry<Category, BigDecimal> entry
                : expensesByCategory.entrySet()) {

            Category category = entry.getKey();
            BigDecimal amount = entry.getValue();

            BigDecimal percentageOfExpenses = BigDecimal.ZERO;

            if (expense.compareTo(BigDecimal.ZERO) > 0) {
                percentageOfExpenses = amount
                        .divide(expense, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            BigDecimal percentageOfIncome = BigDecimal.ZERO;

            if (income.compareTo(BigDecimal.ZERO) > 0) {
                percentageOfIncome = amount
                        .divide(income, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            result.add(
                    new CategoryStatisticsResponse(
                            category,
                            amount,
                            percentageOfExpenses,
                            percentageOfIncome
                    )
            );
        }

        return result;
    }
    // ===== DASHBOARD =====

    public DashboardResponse getDashboard(
            LocalDate from,
            LocalDate to
    ) {
        BigDecimal income =
                transactionService.getIncome(from, to);

        BigDecimal expense =
                transactionService.getExpense(from, to);

        BigDecimal savings =
                income.subtract(expense);

        BigDecimal savingsRate = BigDecimal.ZERO;

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = savings
                    .divide(
                            income,
                            4,
                            RoundingMode.HALF_UP
                    )
                    .multiply(BigDecimal.valueOf(100));
        }

        List<CategoryStatisticsResponse> categories =
                getCategoryStatistics(from, to);

        String topExpenseCategory = null;

        if (!categories.isEmpty()) {
            topExpenseCategory = categories.stream()
                    .max((a, b) ->
                            a.getAmount()
                                    .compareTo(b.getAmount()))
                    .get()
                    .getCategory()
                    .name();
        }

        // Balance оставляем общим, за всё время
        BigDecimal balance =
                transactionService.getBalance();

        return new DashboardResponse(
                balance,
                income,
                expense,
                savings,
                savingsRate,
                topExpenseCategory,
                categories
        );
    }


}
