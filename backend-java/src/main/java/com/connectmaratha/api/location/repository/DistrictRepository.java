package com.connectmaratha.api.location.repository;

import com.connectmaratha.api.location.entity.District;


import org.springframework.data.jpa.repository.JpaRepository;

public interface DistrictRepository extends JpaRepository<District, String> {
}
