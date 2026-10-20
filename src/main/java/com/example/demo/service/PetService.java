package com.example.demo.service;

import com.example.demo.dto.PetItem;
import com.example.demo.dto.PetResponse;
import com.example.demo.dto.PetUpdateRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PetService {

    private static final int[] STAGE_THRESHOLDS = {500, 2000, 5000, 10000};

    private static final List<PetItem> items = List.of(
            new PetItem("tshirt", "clothing", "T-shirt", 1),
            new PetItem("hoodie", "clothing", "Hoodie", 2),
            new PetItem("suit", "clothing", "Suit", 3),
            new PetItem("cape", "clothing", "Hero cape", 4),

            new PetItem("cap", "hat", "Cap", 1),
            new PetItem("party", "hat", "Party hat", 2),
            new PetItem("tophat", "hat", "Top hat", 3),
            new PetItem("crown", "hat", "Crown", 5)

    );
    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public PetService(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    private User getUser(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    private int stageFor(BigDecimal balance){
        int stage = 1;

        for (int threshold : STAGE_THRESHOLDS){
            if(balance.compareTo(BigDecimal.valueOf(threshold)) >= 0){
                stage ++;
            }
        }
        return stage;
    }

    private String wornItem(String id, String slot, int stage){
        if(id==null){
            return null;
        }
        return items.stream()
                .filter(item -> item.id().equals(id) && item.slot().equals(slot))
                .filter(item -> item.requiredStage() <= stage)
                .map(PetItem::id)
                .findFirst()
                .orElse(null);
    }

    private String checkEquip(String id, String slot, int stage){
        if (id==null || id.isBlank()){
            return null;
        }
        PetItem item = items.stream()
                .filter(i -> i.id().equals(id) && i.slot().equals(slot))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown pet item:" + id));
        if (item.requiredStage() >stage){
            throw new IllegalArgumentException(
                    item.name() + " unlock at stage " + item.requiredStage());
        }
        return item.id();
    }


    public PetResponse getPet(Long userId) {
        User user = getUser(userId);
        BigDecimal balance = transactionService.getBalance(userId);
        int stage = stageFor(balance);
        return new PetResponse(
                balance,
                stage,
                wornItem(user.getPetClothing(), "clothing", stage),
                wornItem(user.getPetHat(), "hat", stage),
                items
        );
    }

    public PetResponse updatePet(Long userId, PetUpdateRequest request) {
        User user = getUser(userId);
        int stage = stageFor(transactionService.getBalance(userId));

        user.setPetClothing(checkEquip(request.clothing(), "clothing", stage));
        user.setPetHat(checkEquip(request.hat(), "hat", stage));
        userRepository.save(user);

        return getPet(userId);
    }


}
