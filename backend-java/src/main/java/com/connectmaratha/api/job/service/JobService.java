package com.connectmaratha.api.job.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.job.entity.Job;
import com.connectmaratha.api.job.repository.JobRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Job board (backend/routes/jobs.routes.js). */
@Service
public class JobService {

    private final JobRepository jobs;

    public JobService(JobRepository jobs) {
        this.jobs = jobs;
    }

    public Map<String, Object> list(String category, String district, String search) {
        String categoryFilter = Js.truthy(category) && !"all".equals(category) ? category : null;
        String districtFilter = Js.truthy(district) && !"सर्व".equals(district) ? district : null;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Job j : jobs.search(categoryFilter, districtFilter, Js.nullIfFalsy(search))) rows.add(json(j));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("jobs", rows);
        return out;
    }

    public Map<String, Object> detail(String id) {
        Job j = jobs.findById(id).orElseThrow(() -> ApiException.plain(HttpStatus.NOT_FOUND, "नोकरी संधी आढळली नाही."));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("job", json(j));
        return out;
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> b) {
        if (!Js.truthy(b.get("title")) || !Js.truthy(b.get("company"))) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "पदाचे नाव आणि कंपनी आवश्यक आहे.");
        }
        String id = Ids.twoDigit("JOB-", jobs::existsById);
        jobs.insertJob(id, Js.string(b.get("title")), Js.string(b.get("company")),
            Js.orElse(b.get("district"), "पुणे"), Js.orElse(b.get("category"), "सामान्य"),
            Js.orElse(b.get("salary"), "चर्चेनुसार"), Js.orElse(b.get("job_type"), "Full-time"),
            Js.orElse(b.get("experience"), "१-३ वर्षे"), Js.textOrEmpty(b.get("desc")),
            Js.textOrEmpty(b.get("contact_email")), Js.textOrEmpty(b.get("phone")));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "नोकरी जाहिरात प्रसिद्ध झाली!");
        out.put("job", json(jobs.findById(id).orElseThrow()));
        return out;
    }

    @Transactional
    public Map<String, Object> apply(String jobId, Map<String, Object> b) {
        if (!Js.truthy(b.get("applicant_name")) || !Js.truthy(b.get("phone"))) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "अर्जदाराचे नाव आणि फोन नंबर आवश्यक आहे.");
        }
        jobs.insertApplication(Ids.millis("APP-", jobs::applicationExists), jobId, Js.string(b.get("applicant_name")),
            Js.string(b.get("phone")), Js.textOrEmpty(b.get("email")), Js.textOrEmpty(b.get("resume_summary")));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "आपला नोकरी अर्ज यशस्वीरित्या सादर करण्यात आला!");
        return out;
    }

    static Map<String, Object> json(Job j) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", j.getId());
        out.put("title", j.getTitle());
        out.put("company", j.getCompany());
        out.put("district", j.getDistrict());
        out.put("category", j.getCategory());
        out.put("salary", j.getSalary());
        out.put("job_type", j.getJobType());
        out.put("experience", j.getExperience());
        out.put("desc", j.getDesc());
        out.put("contact_email", j.getContactEmail());
        out.put("phone", j.getPhone());
        out.put("created_at", j.getCreatedAt());
        out.put("poster_id", j.getPosterId());
        return out;
    }
}
