package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController{

    @GetMapping("/")
    public String hello()
    {
        return "hello this is auth";
    }
}