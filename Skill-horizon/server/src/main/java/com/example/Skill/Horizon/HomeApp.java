package com.example.Skill.Horizon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
})
public class HomeApp {
    public static void main(String[] args) {
        SpringApplication.run(HomeApp.class, args);

}
}