package com.example.demo.controller;

import com.example.demo.dto.PetResponse;
import com.example.demo.dto.PetUpdateRequest;
import com.example.demo.security.SecurityUtils;
import com.example.demo.service.PetService;
import org.springframework.web.bind.annotation.*;

import java.security.Security;

@RestController
@RequestMapping("/api/pet")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public PetResponse get(){
        return petService.getPet(SecurityUtils.getCurrentUserId());
    }

    @PutMapping
    public PetResponse update(@RequestBody PetUpdateRequest request) {
        return petService.updatePet(SecurityUtils.getCurrentUserId(), request);
    }


}
