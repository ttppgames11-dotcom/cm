package com.connectmaratha.api.common.web;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import java.io.IOException;
import java.math.BigDecimal;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Numbers in replies look like the Node server's (JavaScript): a whole double is written
 * without ".0" (5, 1000000) and large values are never in exponent form (12345678.5, not 1.23E7).
 */
@Configuration
public class JsonConfig {

    @Bean
    Jackson2ObjectMapperBuilderCustomizer javascriptNumbers() {
        SimpleModule module = new SimpleModule("javascript-numbers");
        JsonSerializer<Double> doubles = new JsonSerializer<>() {
            @Override
            public void serialize(Double value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                writeJsNumber(value, gen);
            }
        };
        module.addSerializer(Double.class, doubles);
        module.addSerializer(Double.TYPE, doubles);
        return builder -> builder.modulesToInstall(module);
    }

    static void writeJsNumber(double v, JsonGenerator gen) throws IOException {
        if (Double.isNaN(v) || Double.isInfinite(v)) {
            gen.writeNull(); // JSON.stringify writes NaN and Infinity as null
        } else if (v == Math.rint(v) && Math.abs(v) < 1e15) {
            gen.writeNumber((long) v);
        } else {
            gen.writeNumber(BigDecimal.valueOf(v).stripTrailingZeros().toPlainString());
        }
    }
}
