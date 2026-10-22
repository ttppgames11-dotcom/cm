package com.connectmaratha.api.location.repository;

import com.connectmaratha.api.location.entity.State;


import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, String> {
}
