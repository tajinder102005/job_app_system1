package com.tajfolio.com.jobms;

import jdk.jfr.Enabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootTest(classes = JobmsApplication.class, properties = {"eureka.client.enabled=false"})
public class JobmsApplicationTests {

	@Test
	public void contextLoads() {
	}

}
