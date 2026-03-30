package com.tajfolio.com.jobms.job.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "company-service")
public interface CompanyClient {
    @GetMapping("/Companies/{Id}")
    Company getCompanyById(@PathVarible("Id")Long companyId);

}
