package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    
    List<Module> findByActiveOrderByOrderIndexAsc(Boolean active);
    
    List<Module> findByDifficultyAndActiveOrderByOrderIndexAsc(String difficulty, Boolean active);
    
    Optional<Module> findByName(String name);
    
    Optional<Module> findByNameAndActive(String name, Boolean active);
}

