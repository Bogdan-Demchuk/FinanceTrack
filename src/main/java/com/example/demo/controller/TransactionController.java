package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }
    @GetMapping("/user/{userId}")
    public List<Transaction> getByUser(@PathVariable Long userId) {
        return service.getByUser(userId);
    }
    @GetMapping
    public List<Transaction> getAll() {
        return service.getAll();
    }

    @PostMapping
    public void add(@RequestBody Transaction t) {
        service.add(t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody Transaction t) {

        service.update(id, t);
    }

    @GetMapping("/income")
    public BigDecimal income() {
        return service.getIncome();
    }

    @GetMapping("/expense")
    public BigDecimal expense() {
        return service.getExpense();
    }

    @GetMapping("/balance")
    public BigDecimal balance() {
        return service.getBalance();
    }

    @GetMapping("/filter")
    public List<Transaction> filter(

            @RequestParam(required = false)
            String title,

            @RequestParam(required = false)
            Category category,

            @RequestParam(required = false)
            TransactionType type,

            @RequestParam(required = false)
            BigDecimal minAmount,

            @RequestParam(required = false)
            BigDecimal maxAmount,

            @RequestParam(required = false)
            LocalDate from,

            @RequestParam(required = false)
            LocalDate to
    ) {
        return service.filter(
                title,
                category,
                type,
                minAmount,
                maxAmount,
                from,
                to
        );
    }

}