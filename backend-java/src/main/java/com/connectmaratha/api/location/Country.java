package com.connectmaratha.api.location;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A row of the existing countries table (database/migrations/001_create_location_hierarchy.sql). Read-only here. */
@Entity
@Table(name = "countries")
public class Country {

    @Id
    private String id;
    private String name;
    private String code;

    protected Country() {
        // for JPA
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
}
