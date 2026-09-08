package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private BigDecimal balance;
    private BigDecimal income;
    private BigDecimal expense;

    private BigDecimal savings;
    private BigDecimal savingsRate;

    private String topExpenseCategory;
    private List<CategoryStatisticsResponse> categories;

    public DashboardResponse(
            BigDecimal balance,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal savings,
            BigDecimal savingsRate,
            String topExpenseCategory,
            List<CategoryStatisticsResponse> categories
    ) {
        this.balance = balance;
        this.income = income;
        this.expense = expense;
        this.savings = savings;
        this.savingsRate = savingsRate;
        this.topExpenseCategory = topExpenseCategory;
        this.categories = categories;
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

    public BigDecimal getSavings() {
        return savings;
    }

    public BigDecimal getSavingsRate() {
        return savingsRate;
    }

    public String getTopExpenseCategory() {
        return topExpenseCategory;
    }

    public List<CategoryStatisticsResponse> getCategories() {
        return categories;
    }
}
