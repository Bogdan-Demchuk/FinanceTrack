package com.example.demo.controller;

import com.example.demo.dto.BalanceResponse;
import com.example.demo.service.StatisticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService service;

    public StatisticsController(StatisticsService service) {
        this.service = service;
    }

    @GetMapping
    public BalanceResponse getStatistics() {
        return service.getStatistics();
    }
}