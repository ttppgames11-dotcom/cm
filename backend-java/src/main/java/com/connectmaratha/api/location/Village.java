package com.connectmaratha.api.location;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A row of the existing villages table (database/migrations/001_create_location_hierarchy.sql). Read-only here. */
@Entity
@Table(name = "villages")
public class Village {

    @Id
    private String id;
    private String talukaId;
    private String name;
    private String code;

    protected Village() {
        // for JPA
    }

    public String getId() { return id; }
    public String getTalukaId() { return talukaId; }
    public String getName() { return name; }
    public String getCode() { return code; }
}
