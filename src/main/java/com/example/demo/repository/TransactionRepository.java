package com.example.demo.repository;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

    // Used for update/delete: guarantees a user can only ever touch their own transactions,
    // even if they guess or tamper with another user's transaction id.
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
}
