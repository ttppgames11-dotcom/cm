package com.connectmaratha.api.location.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A row of the existing states table (database/migrations/001_create_location_hierarchy.sql). Read-only here. */
@Entity
@Table(name = "states")
public class State {

    @Id
    private String id;
    private String countryId;
    private String name;
    private String code;

    protected State() {
        // for JPA
    }

    public String getId() { return id; }
    public String getCountryId() { return countryId; }
    public String getName() { return name; }
    public String getCode() { return code; }
}
