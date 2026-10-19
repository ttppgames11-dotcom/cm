package com.connectmaratha.api.member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A row of the existing {@code members} table (database/migrations/001_initial.sql
 * plus later ALTERs). Dates are TEXT in the schema, so they stay Strings here.
 * Field names map to snake_case columns (referenceId -> reference_id).
 */
@Entity
@Table(name = "members")
@org.hibernate.annotations.DynamicInsert
@org.hibernate.annotations.DynamicUpdate
public class Member {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String passwordHash;
    private String avatar;
    private String photo;

    private String city;
    private String district;
    private String state;
    private String country;
    private String taluka;
    private String village;
    private String countryId;
    private String stateId;
    private String districtId;
    private String talukaId;
    private String villageId;

    private String profession;
    private String business;
    private String skills;
    private String education;
    private String interests;
    private String about;

    private String tier;
    private String role;
    private String status;
    private String authProvider;

    private Integer verifiedMobile;
    private Integer verifiedEmail;
    private Integer verifiedProfile;

    private String referenceId;
    private String referralId;
    private String referredBy;
    private Integer totalReferrals;

    private String joined;
    private String createdAt;
    private String lastLoginAt;

    protected Member() {
        // for JPA
    }

    public Member(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getTaluka() { return taluka; }
    public void setTaluka(String taluka) { this.taluka = taluka; }
    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }
    public String getCountryId() { return countryId; }
    public void setCountryId(String countryId) { this.countryId = countryId; }
    public String getStateId() { return stateId; }
    public void setStateId(String stateId) { this.stateId = stateId; }
    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }
    public String getTalukaId() { return talukaId; }
    public void setTalukaId(String talukaId) { this.talukaId = talukaId; }
    public String getVillageId() { return villageId; }
    public void setVillageId(String villageId) { this.villageId = villageId; }
    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }
    public String getBusiness() { return business; }
    public void setBusiness(String business) { this.business = business; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
    public Integer getVerifiedMobile() { return verifiedMobile; }
    public void setVerifiedMobile(Integer verifiedMobile) { this.verifiedMobile = verifiedMobile; }
    public Integer getVerifiedEmail() { return verifiedEmail; }
    public void setVerifiedEmail(Integer verifiedEmail) { this.verifiedEmail = verifiedEmail; }
    public Integer getVerifiedProfile() { return verifiedProfile; }
    public void setVerifiedProfile(Integer verifiedProfile) { this.verifiedProfile = verifiedProfile; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getReferralId() { return referralId; }
    public void setReferralId(String referralId) { this.referralId = referralId; }
    public String getReferredBy() { return referredBy; }
    public void setReferredBy(String referredBy) { this.referredBy = referredBy; }
    public Integer getTotalReferrals() { return totalReferrals; }
    public void setTotalReferrals(Integer totalReferrals) { this.totalReferrals = totalReferrals; }
    public String getJoined() { return joined; }
    public void setJoined(String joined) { this.joined = joined; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(String lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}
