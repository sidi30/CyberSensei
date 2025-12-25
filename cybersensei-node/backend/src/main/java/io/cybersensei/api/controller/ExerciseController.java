package io.cybersensei.api.controller;

import io.cybersensei.domain.entity.Exercise;
import io.cybersensei.domain.repository.ExerciseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@Tag(name = "Exercises", description = "Exercises CRUD (dev/demo)")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    @GetMapping
    @Operation(summary = "List exercises")
    public ResponseEntity<List<Exercise>> list() {
        return ResponseEntity.ok(exerciseRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exercise by id")
    public ResponseEntity<Exercise> get(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create exercise")
    public ResponseEntity<Exercise> create(@RequestBody Exercise payload) {
        return ResponseEntity.ok(exerciseRepository.save(payload));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update exercise")
    public ResponseEntity<Exercise> update(@PathVariable Long id, @RequestBody Exercise payload) {
        return exerciseRepository.findById(id)
                .map(existing -> {
                    existing.setTopic(payload.getTopic());
                    existing.setType(payload.getType());
                    existing.setDifficulty(payload.getDifficulty());
                    existing.setPayloadJSON(payload.getPayloadJSON());
                    existing.setActive(payload.getActive());
                    return ResponseEntity.ok(exerciseRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete exercise")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (exerciseRepository.existsById(id)) {
            exerciseRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


