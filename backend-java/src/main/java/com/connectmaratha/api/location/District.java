package com.connectmaratha.api.location;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A row of the existing districts table (database/migrations/001_create_location_hierarchy.sql). Read-only here. */
@Entity
@Table(name = "districts")
public class District {

    @Id
    private String id;
    private String stateId;
    private String name;
    private String code;

    protected District() {
        // for JPA
    }

    public String getId() { return id; }
    public String getStateId() { return stateId; }
    public String getName() { return name; }
    public String getCode() { return code; }
}
