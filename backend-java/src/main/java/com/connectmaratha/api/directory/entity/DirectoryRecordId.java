package com.connectmaratha.api.directory.entity;

import java.io.Serializable;
import java.util.Objects;

/** Primary key of directory_records: (collection, id). */
public class DirectoryRecordId implements Serializable {

    private String collection;
    private String id;

    public DirectoryRecordId() {}

    public DirectoryRecordId(String collection, String id) {
        this.collection = collection;
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof DirectoryRecordId k && Objects.equals(collection, k.collection) && Objects.equals(id, k.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(collection, id);
    }
}
