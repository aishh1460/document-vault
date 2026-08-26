package com.examly.springapp.repository;

import com.examly.springapp.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdOrderByReminderDateAsc(Long userId);
    List<Reminder> findByUserIdAndActiveTrueOrderByReminderDateAsc(Long userId);
    List<Reminder> findByDocumentId(Long documentId);
    List<Reminder> findByActiveTrueAndReminderDateLessThanEqual(LocalDate date);
}
