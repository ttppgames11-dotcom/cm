package com.connectmaratha.api.location.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A row of the existing talukas table (database/migrations/001_create_location_hierarchy.sql). Read-only here. */
@Entity
@Table(name = "talukas")
public class Taluka {

    @Id
    private String id;
    private String districtId;
    private String name;
    private String code;

    protected Taluka() {
        // for JPA
    }

    public String getId() { return id; }
    public String getDistrictId() { return districtId; }
    public String getName() { return name; }
    public String getCode() { return code; }
}
