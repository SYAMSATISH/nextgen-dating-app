package com.nextgen.dating.model;

public class VerifySelfieRequest {

    private String userId;
    private String selfie;
    private String profilePhoto;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSelfie() { return selfie; }
    public void setSelfie(String selfie) { this.selfie = selfie; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
}