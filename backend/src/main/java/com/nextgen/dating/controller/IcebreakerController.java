package com.nextgen.dating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class IcebreakerController {

    @PostMapping("/icebreakers")
    public ResponseEntity<?> getIcebreakers(@RequestBody Map<String, Object> request) {
        Map<String, Object> user1 = (Map<String, Object>) request.get("user1");
        Map<String, Object> user2 = (Map<String, Object>) request.get("user2");
        
        String name1 = (String) user1.get("name");
        String name2 = (String) user2.get("name");
        
        List<String> icebreakers = new ArrayList<>();
        icebreakers.add("Hi " + name2 + "! What's your favorite hobby?");
        icebreakers.add("Hey " + name2 + ", " + name1 + " wants to know your favorite movie!");
        icebreakers.add("What's one thing you can't live without?");
        
        Map<String, Object> response = new HashMap<>();
        response.put("icebreakers", icebreakers);
        
        return ResponseEntity.ok(response);
    }
}