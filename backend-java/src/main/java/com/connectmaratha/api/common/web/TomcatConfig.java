package com.connectmaratha.api.common.web;

import org.apache.tomcat.util.buf.EncodedSolidusHandling;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

/**
 * Tomcat refuses paths containing an encoded "/" (%2F) with its own HTML page. Passing them
 * through (still encoded, never decoded into real path separators) lets the endpoint's own
 * checks refuse them with the API's normal JSON error, as the Node server does.
 */
@Component
public class TomcatConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector ->
            connector.setEncodedSolidusHandling(EncodedSolidusHandling.PASS_THROUGH.getValue()));
    }
}
