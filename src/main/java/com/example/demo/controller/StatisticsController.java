package com.example.demo.controller;
import com.example.demo.dto.CategoryStatisticsResponse;
import com.example.demo.dto.DashboardResponse;

import java.util.List;

import com.example.demo.dto.BalanceResponse;
import com.example.demo.dto.PeriodStatisticsResponse;
import com.example.demo.service.StatisticsService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService service;

    public StatisticsController(StatisticsService service) {
        this.service = service;
    }

    // Статистика за всё время
    @GetMapping
    public BalanceResponse getStatistics() {
        return service.getStatistics();
    }

    // Статистика за выбранный период
    @GetMapping("/period")
    public PeriodStatisticsResponse getPeriodStatistics(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        return service.getPeriodStatistics(from, to);
    }
    @GetMapping("/period/categories")
    public List<CategoryStatisticsResponse> getCategoryStatistics(

            @RequestParam(required = false)
            LocalDate from,

            @RequestParam(required = false)
            LocalDate to

    ) {
        return service.getCategoryStatistics(from, to);
    }
    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        return service.getDashboard(from, to);
    }


}
