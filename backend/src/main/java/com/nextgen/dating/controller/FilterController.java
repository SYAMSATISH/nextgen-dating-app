package com.nextgen.dating.controller;

import com.nextgen.dating.model.FilterRequest;
import com.nextgen.dating.model.FilterResponse;
import com.nextgen.dating.service.FilterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class FilterController {

    private final FilterService filterService;

    public FilterController(FilterService filterService) {
        this.filterService = filterService;
    }

    @PostMapping("/filters/compatible")
    public ResponseEntity<FilterResponse> getCompatibleMatches(
            @Valid @RequestBody FilterRequest request) {

        FilterResponse response = filterService.getCompatibleMatches(request);

        if (!response.isSuccess()) {
            return ResponseEntity.internalServerError().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
