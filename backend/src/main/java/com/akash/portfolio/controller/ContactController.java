package com.akash.portfolio.controller;

import com.akash.portfolio.model.ContactMessage;
import com.akash.portfolio.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow requests from all origins (static frontends)
public class ContactController {

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username}")
    private String myEmail;

    @PostMapping("/contact")
    public ResponseEntity<?> handleContactForm(@RequestBody ContactMessage message) {
        try {
            // Compose email content
            String emailBody = String.format(
                "You have received a new message from your portfolio contact form:\n\n" +
                "Sender Name: %s\n" +
                "Sender Email: %s\n" +
                "Subject: %s\n\n" +
                "Message Content:\n%s\n",
                message.getName(),
                message.getEmail(),
                message.getSubject(),
                message.getMessage()
            );

            // Send email to YOUR own email address
            emailService.sendEmail(myEmail, "Portfolio Contact: " + message.getSubject(), emailBody);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Message sent successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
