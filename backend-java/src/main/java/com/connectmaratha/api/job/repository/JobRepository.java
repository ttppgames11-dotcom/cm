package com.connectmaratha.api.job.repository;

import com.connectmaratha.api.job.entity.Job;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, String> {

    @Query(nativeQuery = true, value = """
        SELECT * FROM jobs
        WHERE (CAST(:category AS TEXT) IS NULL OR category = CAST(:category AS TEXT))
          AND (CAST(:district AS TEXT) IS NULL OR district = CAST(:district AS TEXT))
          AND (CAST(:search AS TEXT) IS NULL
               OR title ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR company ILIKE CONCAT('%', CAST(:search AS TEXT), '%')
               OR "desc" ILIKE CONCAT('%', CAST(:search AS TEXT), '%'))
        ORDER BY created_at DESC""")
    List<Job> search(@Param("category") String category, @Param("district") String district, @Param("search") String search);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO jobs (id, title, company, district, category, salary, job_type, experience, "desc", contact_email, phone, created_at)
        VALUES (:id, :title, :company, :district, :category, :salary, :jobType, :experience, :desc, :contactEmail, :phone,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertJob(@Param("id") String id, @Param("title") String title, @Param("company") String company,
                   @Param("district") String district, @Param("category") String category, @Param("salary") String salary,
                   @Param("jobType") String jobType, @Param("experience") String experience, @Param("desc") String desc,
                   @Param("contactEmail") String contactEmail, @Param("phone") String phone);

    @Query(nativeQuery = true, value = "SELECT COUNT(*) > 0 FROM job_applications WHERE id = :id")
    boolean applicationExists(@Param("id") String id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO job_applications (id, job_id, applicant_name, phone, email, resume_summary, created_at)
        VALUES (:id, :jobId, :name, :phone, :email, :summary, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertApplication(@Param("id") String id, @Param("jobId") String jobId, @Param("name") String name,
                           @Param("phone") String phone, @Param("email") String email, @Param("summary") String summary);
}
