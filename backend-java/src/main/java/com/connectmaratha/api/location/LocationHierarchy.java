package com.connectmaratha.api.location;


import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Port of validateLocationHierarchy and the id-to-name lookups used by registration. */
@Service
public class LocationHierarchy {

    private final CountryRepository countries;
    private final StateRepository states;
    private final DistrictRepository districts;
    private final TalukaRepository talukas;
    private final VillageRepository villages;

    public LocationHierarchy(CountryRepository countries, StateRepository states, DistrictRepository districts,
                             TalukaRepository talukas, VillageRepository villages) {
        this.countries = countries;
        this.states = states;
        this.districts = districts;
        this.talukas = talukas;
        this.villages = villages;
    }

    /** The error message for the first problem, or empty when the selection is consistent. */
    public Optional<String> validate(String countryId, String stateId, String districtId, String talukaId, String villageId) {
        if (present(countryId) && countries.findById(countryId).isEmpty()) {
            return Optional.of("निवडलेला देश अमान्य आहे (Invalid Country).");
        }
        if (present(stateId)) {
            State s = states.findById(stateId).orElse(null);
            if (s == null) return Optional.of("निवडलेले राज्य अमान्य आहे (Invalid State).");
            if (present(countryId) && !Objects.equals(s.getCountryId(), countryId)) {
                return Optional.of("राज्य आणि देशाचा संबंध जुळत नाही (State does not belong to selected Country).");
            }
        }
        if (present(districtId)) {
            District d = districts.findById(districtId).orElse(null);
            if (d == null) return Optional.of("निवडलेला जिल्हा अमान्य आहे (Invalid District).");
            if (present(stateId) && !Objects.equals(d.getStateId(), stateId)) {
                return Optional.of("जिल्हा आणि राज्याचा संबंध जुळत नाही (District does not belong to selected State).");
            }
        }
        if (present(talukaId)) {
            Taluka t = talukas.findById(talukaId).orElse(null);
            if (t == null) return Optional.of("निवडलेला तालुका अमान्य आहे (Invalid Taluka).");
            if (present(districtId) && !Objects.equals(t.getDistrictId(), districtId)) {
                return Optional.of("तालुका आणि जिल्ह्याचा संबंध जुळत नाही (Taluka does not belong to selected District).");
            }
        }
        if (present(villageId)) {
            Village v = villages.findById(villageId).orElse(null);
            if (v == null) return Optional.of("निवडलेले गाव अमान्य आहे (Invalid Village).");
            if (present(talukaId) && !Objects.equals(v.getTalukaId(), talukaId)) {
                return Optional.of("गाव आणि तालुक्याचा संबंध जुळत नाही (Village does not belong to selected Taluka).");
            }
        }
        return Optional.empty();
    }

    public Optional<String> countryName(String id) { return present(id) ? countries.findById(id).map(Country::getName) : Optional.empty(); }
    public Optional<String> stateName(String id) { return present(id) ? states.findById(id).map(State::getName) : Optional.empty(); }
    public Optional<String> districtName(String id) { return present(id) ? districts.findById(id).map(District::getName) : Optional.empty(); }
    public Optional<String> talukaName(String id) { return present(id) ? talukas.findById(id).map(Taluka::getName) : Optional.empty(); }
    public Optional<String> villageName(String id) { return present(id) ? villages.findById(id).map(Village::getName) : Optional.empty(); }

    private static boolean present(String s) {
        return s != null && !s.isEmpty();
    }
}
