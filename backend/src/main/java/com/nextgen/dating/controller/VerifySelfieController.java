package com.nextgen.dating.controller;

import com.nextgen.dating.model.VerifySelfieRequest;
import com.nextgen.dating.model.VerifySelfieResponse;
import com.nextgen.dating.service.VerifySelfieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;

@RestController
@RequestMapping("/api")
public class VerifySelfieController {

    private final VerifySelfieService verifySelfieService;

    public VerifySelfieController(VerifySelfieService verifySelfieService) {
        this.verifySelfieService = verifySelfieService;
    }
    @PostMapping("/verify-selfie")
public ResponseEntity<?> verifySelfie(@RequestBody VerifySelfieRequest request) {
    if (request.getSelfie() == null || request.getProfilePhoto() == null) {
        return ResponseEntity.badRequest().body("selfie and profilePhoto are required.");
    }
    return ResponseEntity.ok(verifySelfieService.verify(request));
}

   
}