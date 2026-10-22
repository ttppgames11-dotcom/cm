package com.connectmaratha.api.location.controller;

import com.connectmaratha.api.location.service.LocationService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/locations/* — the same endpoints as backend/routes/locations.routes.js. */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locations;

    public LocationController(LocationService locations) {
        this.locations = locations;
    }

    @GetMapping("/countries")
    public Map<String, Object> countries() {
        return locations.countries();
    }

    @GetMapping("/states")
    public Map<String, Object> states(@RequestParam(required = false) String countryId) {
        return locations.states(countryId);
    }

    @GetMapping("/districts")
    public Map<String, Object> districts(@RequestParam(required = false) String stateId) {
        return locations.districts(stateId);
    }

    @GetMapping("/talukas")
    public Map<String, Object> talukas(@RequestParam(required = false) String districtId) {
        return locations.talukas(districtId);
    }

    @GetMapping("/villages")
    public Map<String, Object> villages(@RequestParam(required = false) String talukaId,
                                        @RequestParam(required = false) String search,
                                        @RequestParam(required = false) String page,
                                        @RequestParam(required = false) String limit) {
        return locations.villages(talukaId, search, page, limit);
    }
}
