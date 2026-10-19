package com.connectmaratha.api.repository;

import com.connectmaratha.api.entity.State;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, String> {
}
