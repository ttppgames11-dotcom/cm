package com.connectmaratha.api.directory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

/**
 * One builders/dairy record (table directory_records): which list it belongs to, its id, the
 * record itself as JSON text (exactly what the API returns) and an order number (newest highest).
 */
@Entity
@Table(name = "directory_records")
@IdClass(DirectoryRecordId.class)
public class DirectoryRecord {

    @Id private String collection;
    @Id private String id;
    @Column(nullable = false) private String data;
    @Column(nullable = false) private Long seq;

    protected DirectoryRecord() {}

    public DirectoryRecord(String collection, String id, String data, long seq) {
        this.collection = collection;
        this.id = id;
        this.data = data;
        this.seq = seq;
    }

    public String getCollection() { return collection; }
    public String getId() { return id; }
    public String getData() { return data; }
    public Long getSeq() { return seq; }
}
