package com.connectmaratha.api.crmunit.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.crmunit.service.CrmActivityService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/crm-hierarchy: the yearly activities of a CRM unit (see CrmActivityService). */
@RestController
@RequestMapping("/api/crm-hierarchy")
public class CrmActivityController {

    private final CrmActivityService activities;
    private final JsonBody bodies;

    public CrmActivityController(CrmActivityService activities, JsonBody bodies) {
        this.activities = activities;
        this.bodies = bodies;
    }

    /** The 12 activity types with their Marathi names and default targets. */
    @GetMapping("/activity-types")
    public Map<String, Object> types() {
        return activities.types();
    }

    /** A unit's activities of a year; optional ?year=, ?type=, ?status=. */
    @GetMapping("/units/{id}/activities")
    public Map<String, Object> list(@PathVariable String id, CurrentUser user,
                                    @RequestParam(required = false) String year,
                                    @RequestParam(required = false) String type,
                                    @RequestParam(required = false) String status) {
        return activities.list(user, id, year, type, status);
    }

    /** { year, targets: { type: number } }: creates the missing types of the year, one per month. */
    @RequireAuth
    @PostMapping("/units/{id}/plan")
    public ResponseEntity<Map<String, Object>> plan(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activities.plan(user, id, bodies.read(req)));
    }

    /** { type, scheduledDate, targetCount, title, notes }: adds one activity. */
    @RequireAuth
    @PostMapping("/units/{id}/activities")
    public ResponseEntity<Map<String, Object>> add(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activities.add(user, id, bodies.read(req)));
    }

    /** Change an activity that is not done yet. */
    @RequireAuth
    @PutMapping("/units/{id}/activities/{activityId}")
    public Map<String, Object> update(@PathVariable String id, @PathVariable String activityId, CurrentUser user, HttpServletRequest req) {
        return activities.update(user, id, activityId, bodies.read(req));
    }

    /** { attendeeCount, notes, photoUrl }: marks the activity done; this is final. */
    @RequireAuth
    @PostMapping("/units/{id}/activities/{activityId}/complete")
    public Map<String, Object> complete(@PathVariable String id, @PathVariable String activityId, CurrentUser user, HttpServletRequest req) {
        return activities.complete(user, id, activityId, bodies.read(req));
    }

    /** Remove an activity (the unit's owner or an admin; a done record only an admin). */
    @RequireAuth
    @DeleteMapping("/units/{id}/activities/{activityId}")
    public Map<String, Object> delete(@PathVariable String id, @PathVariable String activityId, CurrentUser user) {
        return activities.delete(user, id, activityId);
    }
}
