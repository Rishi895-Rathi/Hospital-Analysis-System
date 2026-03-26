package com.example.demo.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponseDTO {

    private Long Patient_id;
    private String name;
    private int age;
    private String email;
    private String phone;
    private String disease;
    private String bloodGroup;
    private String address;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}