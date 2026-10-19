package com.connectmaratha.api.web;

import com.connectmaratha.api.ratelimit.AuthOutcomeInterceptor;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final AuthOutcomeInterceptor authOutcome;

    public WebConfig(AuthInterceptor authInterceptor, AuthOutcomeInterceptor authOutcome) {
        this.authInterceptor = authInterceptor;
        this.authOutcome = authOutcome;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor);
        registry.addInterceptor(authOutcome);
    }

    /** Open CORS, as the Node backend has (app.use(cors())). */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOriginPatterns("*").allowedMethods("*").allowedHeaders("*");
    }

    /** Lets controller methods take a {@code CurrentUser} parameter (null when logged out). */
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.getParameterType() == CurrentUser.class;
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mav,
                                          NativeWebRequest request, WebDataBinderFactory binders) {
                return request.getAttribute(CurrentUser.ATTRIBUTE, RequestAttributes.SCOPE_REQUEST);
            }
        });
    }
}
