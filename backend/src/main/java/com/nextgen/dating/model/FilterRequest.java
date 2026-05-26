package com.nextgen.dating.model;

import java.util.List;

public class FilterRequest {
    private String userId;
    private Filters filters;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Filters getFilters() { return filters; }
    public void setFilters(Filters filters) { this.filters = filters; }

    public static class Filters {
        private String career;
        private String lifestyle;
        private List<Integer> ageRange;
        private String location;

        public String getCareer() { return career; }
        public void setCareer(String career) { this.career = career; }
        public String getLifestyle() { return lifestyle; }
        public void setLifestyle(String lifestyle) { this.lifestyle = lifestyle; }
        public List<Integer> getAgeRange() { return ageRange; }
        public void setAgeRange(List<Integer> ageRange) { this.ageRange = ageRange; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }
}
