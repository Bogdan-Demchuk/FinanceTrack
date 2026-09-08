package com.example.demo.dto;

import com.example.demo.model.Category;

import java.math.BigDecimal;

public class CategoryStatisticsResponse {

    private Category category;
    private BigDecimal amount;
    private BigDecimal percentageOfExpenses;
    private BigDecimal percentageOfIncome;

    public CategoryStatisticsResponse(
            Category category,
            BigDecimal amount,
            BigDecimal percentageOfExpenses,
            BigDecimal percentageOfIncome
    ) {
        this.category = category;
        this.amount = amount;
        this.percentageOfExpenses = percentageOfExpenses;
        this.percentageOfIncome = percentageOfIncome;
    }

    public Category getCategory() {
        return category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getPercentageOfExpenses() {
        return percentageOfExpenses;
    }

    public BigDecimal getPercentageOfIncome() {
        return percentageOfIncome;
    }
}
