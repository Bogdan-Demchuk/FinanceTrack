package com.example.demo.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PeriodStatisticsResponse {

    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;
    private BigDecimal savingsRate;

    public PeriodStatisticsResponse(
            BigDecimal income,
            BigDecimal expense
    ) {
        this.income = income;
        this.expense = expense;

        // Сколько денег осталось
        this.savings = income.subtract(expense);

        // Какой процент дохода удалось сохранить
        if (income.compareTo(BigDecimal.ZERO) > 0) {

            this.savingsRate = savings
                    .divide(income, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

        } else {
            this.savingsRate = BigDecimal.ZERO;
        }
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
}
