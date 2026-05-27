package com.nextgen.dating.controller;

import com.nextgen.dating.model.DateEntry;
import com.nextgen.dating.service.DateEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dates")
@CrossOrigin(origins = "*")
public class DateEntryController {

    @Autowired
    private DateEntryService service;

    @GetMapping("/{userId}")
    public List<DateEntry> getAll(@PathVariable String userId) {
        return service.getByUser(userId);
    }

    @PostMapping
    public DateEntry create(@RequestBody DateEntry entry) {
        return service.save(entry);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}