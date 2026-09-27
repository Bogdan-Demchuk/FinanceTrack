package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.security.SecurityUtils;
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

    // Every endpoint below is scoped to SecurityUtils.getCurrentUserId() — the id of
    // whoever is logged in for this request — never to an id supplied by the client.
    // This is what stops user A from ever seeing or editing user B's transactions.

    @GetMapping
    public List<Transaction> getAll() {
        return service.getAllForUser(SecurityUtils.getCurrentUserId());
    }

    @PostMapping
    public Transaction add(@RequestBody Transaction t) {
        return service.add(SecurityUtils.getCurrentUserId(), t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(SecurityUtils.getCurrentUserId(), id);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody Transaction t) {

        service.update(SecurityUtils.getCurrentUserId(), id, t);
    }

    @GetMapping("/income")
    public BigDecimal income() {
        return service.getIncome(SecurityUtils.getCurrentUserId());
    }

    @GetMapping("/expense")
    public BigDecimal expense() {
        return service.getExpense(SecurityUtils.getCurrentUserId());
    }

    @GetMapping("/balance")
    public BigDecimal balance() {
        return service.getBalance(SecurityUtils.getCurrentUserId());
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
                SecurityUtils.getCurrentUserId(),
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
