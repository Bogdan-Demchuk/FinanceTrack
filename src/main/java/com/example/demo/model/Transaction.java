package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Transaction {

    private Long id;
    private Long userId;
    private String title;
    private BigDecimal amount;

    private TransactionType type;
    private Category category;

    private LocalDate date;

    public Transaction() {
    }

    public Transaction(Long id,
                       String title,
                       BigDecimal amount,
                       TransactionType type,
                       Category category,
                       LocalDate date,
                       Long userId) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.date = date;
    }
    public Long getId() {
        return id;
    }
    public Long getUserId() {
        return userId;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}