package com.davidryanhall.websocket_app.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;

@RestController
public class WelcomeController {
    @GetMapping("/welcome")
    public ResponseEntity<String> welcome(@RequestParam(value = "name", required = false) String userName) {
        String resp = String.format("Welcome %s", ObjectUtils.isEmpty(userName) ? "user" : userName);
        return ResponseEntity.ok(resp);
    }
}
