package com.examly.springapp.repository;

import com.examly.springapp.model.User;
import com.examly.springapp.model.User.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> findByIsActiveTrue(Pageable pageable);

    Page<User> findByRole(UserRole role, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :timestamp WHERE u.id = :id")
    void updateLastLogin(@Param("id") Long id, @Param("timestamp") LocalDateTime timestamp);

    @Modifying
    @Query("UPDATE User u SET u.isActive = false WHERE u.id = :id")
    void deactivateUser(@Param("id") Long id);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :id")
    void incrementFailedLoginAttempts(@Param("id") Long id);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0 WHERE u.id = :id")
    void resetFailedLoginAttempts(@Param("id") Long id);
}
