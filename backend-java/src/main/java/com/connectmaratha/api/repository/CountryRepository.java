package com.connectmaratha.api.repository;

import com.connectmaratha.api.entity.Country;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CountryRepository extends JpaRepository<Country, String> {
}
