package com.example.demo.model;

import java.time.LocalDate;

public class Transaction {

    private Long id;
    private String title;
    private double amount;

    // INCOME / EXPENSE
    private String type;

    private String category;
    private LocalDate date;

    // 👇 ПУСТОЙ конструктор для Jackson
    public Transaction() {
    }

    public Transaction(Long id,
                       String title,
                       double amount,
                       String type,
                       String category,
                       LocalDate date) {

        this.id = id;
        this.title = title;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.date = date;
    }

    // getters + setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}