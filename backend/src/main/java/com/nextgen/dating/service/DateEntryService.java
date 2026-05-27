package com.nextgen.dating.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.DateEntry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DateEntryService {

    @Value("${data.file.path}")
    private String filePath;

    private final ObjectMapper mapper = new ObjectMapper();

    private List<DateEntry> readAll() {
        try {
            File file = new File(filePath);
            if (!file.exists()) return new ArrayList<>();
            return mapper.readValue(file,
                new TypeReference<List<DateEntry>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private void writeAll(List<DateEntry> entries) {
        try {
            mapper.writeValue(new File(filePath), entries);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<DateEntry> getByUser(String userId) {
        List<DateEntry> all = readAll();
        List<DateEntry> result = new ArrayList<>();
        for (DateEntry e : all) {
            if (userId.equals(e.getUserId())) result.add(e);
        }
        return result;
    }

    public DateEntry save(DateEntry entry) {
        List<DateEntry> all = readAll();
        entry.setId(UUID.randomUUID().toString());
        all.add(entry);
        writeAll(all);
        return entry;
    }

    public void delete(String id) {
        List<DateEntry> all = readAll();
        all.removeIf(e -> id.equals(e.getId()));
        writeAll(all);
    }
}