package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.crmunit.ActivityTypes;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** The yearly progress numbers of CRM units: one unit's own numbers from its activity rows, and sums of them. Pure maths. */
final class UnitProgress {

    private UnitProgress() {}

    /** Whole-number percentage, 0 when there is nothing to divide by. */
    static int pct(int part, int whole) {
        return whole == 0 ? 0 : Math.round(part * 100f / whole);
    }

    /**
     * One unit's numbers for a year from its crm_activities rows. Status is worked out as everywhere else (done stays
     * done; anything else whose date has passed is overdue); coverage counts the types with at least one done activity.
     */
    static Map<String, Object> own(List<Map<String, Object>> rows, LocalDate today) {
        Map<String, int[]> byType = new LinkedHashMap<>();
        for (ActivityTypes.Type t : ActivityTypes.ALL) byType.put(t.key(), new int[5]); // total, done, overdue, target, achieved
        int planned = 0, inProgress = 0, done = 0, overdue = 0, target = 0, achieved = 0;
        for (Map<String, Object> row : rows) {
            LocalDate date = LocalDate.parse(String.valueOf(row.get("scheduled_date")));
            String status = CrmActivityService.derivedStatus((String) row.get("status"), date, today);
            int targetCount = ((Number) row.get("target_count")).intValue();
            int attendees = ((Number) row.get("attendee_count")).intValue();
            int[] t = byType.get(row.get("type"));
            target += targetCount;
            switch (status) {
                case "done" -> { done++; achieved += attendees; }
                case "overdue" -> overdue++;
                case "in_progress" -> inProgress++;
                default -> planned++;
            }
            if (t != null) {
                t[0]++;
                t[3] += targetCount;
                if (status.equals("done")) { t[1]++; t[4] += attendees; }
                if (status.equals("overdue")) t[2]++;
            }
        }
        int typesDone = 0, typesPlanned = 0;
        Map<String, Object> types = new LinkedHashMap<>();
        for (Map.Entry<String, int[]> e : byType.entrySet()) {
            int[] t = e.getValue();
            if (t[0] > 0) typesPlanned++;
            if (t[1] > 0) typesDone++;
            Map<String, Object> j = new LinkedHashMap<>();
            j.put("total", t[0]);
            j.put("done", t[1]);
            j.put("overdue", t[2]);
            j.put("target", t[3]);
            j.put("achieved", t[4]);
            types.put(e.getKey(), j);
        }
        int total = rows.size();
        int required = ActivityTypes.ALL.size();
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("total", total);
        p.put("planned", planned);
        p.put("in_progress", inProgress);
        p.put("done", done);
        p.put("overdue", overdue);
        p.put("targetTotal", target);
        p.put("achievedTotal", achieved);
        p.put("typesDone", typesDone);
        p.put("typesPlanned", typesPlanned);
        p.put("typesRequired", required);
        p.put("coveragePct", pct(typesDone, required));
        p.put("completionPct", pct(done, total));
        p.put("byType", types);
        return p;
    }

    /** The sum of several units' own numbers: the counts and targets added up, the unit count, the average coverage. */
    static Map<String, Object> sum(List<Map<String, Object>> owns) {
        String[] counts = {"total", "planned", "in_progress", "done", "overdue", "targetTotal", "achievedTotal"};
        Map<String, Object> s = new LinkedHashMap<>();
        for (String key : counts) {
            int v = 0;
            for (Map<String, Object> o : owns) v += ((Number) o.get(key)).intValue();
            s.put(key, v);
        }
        int coverageSum = 0, fully = 0;
        for (Map<String, Object> o : owns) {
            int c = ((Number) o.get("coveragePct")).intValue();
            coverageSum += c;
            if (c == 100) fully++;
        }
        s.put("unitsCount", owns.size());
        s.put("avgCoveragePct", owns.isEmpty() ? 0 : Math.round(coverageSum / (float) owns.size()));
        s.put("unitsFullyCovered", fully);
        s.put("completionPct", pct(((Number) s.get("done")).intValue(), ((Number) s.get("total")).intValue()));
        return s;
    }
}
