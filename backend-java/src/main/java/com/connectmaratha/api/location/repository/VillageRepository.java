package com.connectmaratha.api.location.repository;

import com.connectmaratha.api.location.entity.Village;


import org.springframework.data.jpa.repository.JpaRepository;

public interface VillageRepository extends JpaRepository<Village, String> {
}
