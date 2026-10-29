package com.tajfolio.gatway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.web.servlet.function.RequestPredicates.path;

@Configuration
public class GatewayRouteConfig {

    @Bean
    public RouterFunction<ServerResponse> authRoutes() {
        return route("auth_service")
            .route(path("/auth/**"), http())
            .filter(lb("auth-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> adminRoutes() {
        return route("admin_service")
            .route(path("/admin/**"), http())
            .filter(lb("auth-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> profileRoutes() {
        return route("profile_service")
            .route(path("/profile/**"), http())
            .filter(lb("auth-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> companyRoutes() {
        return route("company_service")
            .route(path("/companies/**"), http())
            .filter(lb("company-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> savedJobRoutes() {
        return route("saved_jobs")
            .route(path("/jobs/saved/**"), http())
            .filter(lb("job-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> jobRoutes() {
        return route("job_service")
            .route(path("/jobs/**"), http())
            .filter(lb("job-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> applicationRoutes() {
        return route("application_service")
            .route(path("/applications/**"), http())
            .filter(lb("job-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> resumeRoutes() {
        return route("resume_service")
            .route(path("/resumes/**"), http())
            .filter(lb("job-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> reviewRoutes() {
        return route("review_service")
            .route(path("/reviews/**"), http())
            .filter(lb("review-service"))
            .build();
    }




    @Bean
    public RouterFunction<ServerResponse> notificationRoutes() {
        return route("notification_service")
            .route(path("/notifications/**"), http())
            .filter(lb("notification-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> auditRoutes() {
        return route("audit_service")
            .route(path("/audit/**"), http())
            .filter(lb("job-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> interviewRoutes() {
        return route("interview_service")
            .route(path("/interviews/**"), http())
            .filter(lb("job-service"))
            .build();
    }

    @Bean
    public RouterFunction<ServerResponse> agentRoutes() {
        return route("ai_agent_service")
            .route(path("/agent/**"), http())
            .filter(lb("ai-agent-service"))
            .build();
    }
}
