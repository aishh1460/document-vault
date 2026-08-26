package com.examly.springapp.repository;

import com.examly.springapp.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerId(Long ownerId);
    List<Folder> findByOwnerIdAndParentIsNull(Long ownerId);
    boolean existsByNameAndOwnerIdAndParent(String name, Long ownerId, Folder parent);
    boolean existsByNameAndOwnerIdAndParentIsNull(String name, Long ownerId);
    List<Folder> findByParent(Folder parent);
}
