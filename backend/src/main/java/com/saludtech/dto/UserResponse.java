package com.saludtech.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String documentId;
    private short level;
    private Instant createdAt;
}
