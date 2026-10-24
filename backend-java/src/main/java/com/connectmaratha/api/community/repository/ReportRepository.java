package com.connectmaratha.api.community.repository;

import com.connectmaratha.api.community.entity.Report;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, String> {

    /** Has this reporter already got an open report on the same thing? */
    boolean existsByReporterIdAndTargetTypeAndTargetIdAndStatus(
        String reporterId, String targetType, String targetId, String status);
}
