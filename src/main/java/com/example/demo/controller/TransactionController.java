package com.example.demo.controller;

import com.example.demo.model.Transaction;
import com.example.demo.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
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
    public void update(@PathVariable Long id, @RequestBody Transaction t) {
        service.update(id, t);
    }

    @GetMapping("/income")
    public double income() {
        return service.getIncome();
    }

    @GetMapping("/expense")
    public double expense() {
        return service.getExpense();
    }

    @GetMapping("/balance")
    public double balance() {
        return service.getBalance();
    }

    @GetMapping("/filter")
    public List<Transaction> filter(@RequestParam String category) {
        return service.filterByCategory(category);
    }
}