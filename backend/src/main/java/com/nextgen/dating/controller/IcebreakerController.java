package com.nextgen.dating.controller;

import com.nextgen.dating.model.IcebreakerRequest;
import com.nextgen.dating.model.IcebreakerResponse;
import com.nextgen.dating.service.IcebreakerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class IcebreakerController {

    private final IcebreakerService icebreakerService;

    public IcebreakerController(IcebreakerService icebreakerService) {
        this.icebreakerService = icebreakerService;
    }
    

    @PostMapping("/icebreakers")
    public ResponseEntity<IcebreakerResponse> generateIcebreakers(
            @Valid @RequestBody IcebreakerRequest request) {
        IcebreakerResponse response = icebreakerService.generateIcebreakers(request);
        if (!response.isSuccess()) return ResponseEntity.internalServerError().body(response);
        return ResponseEntity.ok(response);
    }
}