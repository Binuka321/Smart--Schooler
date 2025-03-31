package com.example.Skill.Horizon;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
public class Main {

    
    @RequestMapping("/")
    public String home(){
        return "welcome! to edu learn";

    }
}
