package com.nextgen.dating.model;

public class DateEntry {
    private String id;
    private String userId;
    private String person;
    private String location;
    private String date;
    private int mood;
    private String note;

    // GETTERS
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getPerson() { return person; }
    public String getLocation() { return location; }
    public String getDate() { return date; }
    public int getMood() { return mood; }
    public String getNote() { return note; }

    // MOOD LABEL — auto generated from mood number
    public String getMoodLabel() {
        switch (mood) {
            case 5: return "Amazing 🔥";
            case 4: return "Good 😊";
            case 3: return "Meh 😐";
            case 2: return "Awkward 😬";
            case 1: return "Disaster 💀";
            default: return "Unknown";
        }
    }

    // SETTERS
    public void setId(String id) { this.id = id; }
    public void setUserId(String u) { this.userId = u; }
    public void setPerson(String p) { this.person = p; }
    public void setLocation(String l) { this.location = l; }
    public void setDate(String d) { this.date = d; }
    public void setMood(int m) { this.mood = m; }
    public void setNote(String n) { this.note = n; }
}