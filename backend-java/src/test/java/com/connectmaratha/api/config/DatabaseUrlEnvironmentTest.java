package com.connectmaratha.api.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Test;

class DatabaseUrlEnvironmentTest {

    @Test
    void convertsTheNodeStyleDatabaseUrl() {
        Map<String, Object> p = DatabaseUrlEnvironment.toDatasourceProperties(
            "postgres://cm_user:s3cr%40t@postgres:5432/connect_maratha", false);
        assertThat(p).containsEntry("spring.datasource.url", "jdbc:postgresql://postgres:5432/connect_maratha")
            .containsEntry("spring.datasource.username", "cm_user")
            .containsEntry("spring.datasource.password", "s3cr@t");
    }

    @Test
    void defaultsThePortAndAddsSslWhenAsked() {
        Map<String, Object> p = DatabaseUrlEnvironment.toDatasourceProperties(
            "postgresql://u:p@db.example.com/cm", true);
        assertThat(p).containsEntry("spring.datasource.url", "jdbc:postgresql://db.example.com:5432/cm?sslmode=require");
    }

    @Test
    void rejectsOtherDatabases() {
        assertThatThrownBy(() -> DatabaseUrlEnvironment.toDatasourceProperties("mysql://u:p@h/db", false))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
