package com.dimart.controller;

import com.dimart.model.ContactMessageRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactApiController {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> submit(@Valid @RequestBody ContactMessageRequest request) {
        return Map.of(
                "status", "NEW",
                "message", "Thank you, " + request.getFullName() + ". Dimart support will reply shortly.",
                "receivedAt", Instant.now().toString()
        );
    }
}
