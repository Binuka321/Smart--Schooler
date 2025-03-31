package com.example.Skill.Horizon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringBootApplication
@EnableWebSecurity
public class SkillHorizonApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkillHorizonApplication.class, args);
	}

}
