package com.example.demo.dto;

public class BalanceResponse {

    private double balance;
    private double income;
    private double expense;

    public BalanceResponse(double balance, double income, double expense) {
        this.balance = balance;
        this.income = income;
        this.expense = expense;
    }

    public double getBalance() {
        return balance;
    }

    public double getIncome() {
        return income;
    }

    public double getExpense() {
        return expense;
    }
}