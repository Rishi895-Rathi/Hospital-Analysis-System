package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String emailId;

    @Column(name = "contact_number", length = 15, unique = true)
    private Long contactNumber;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String department;

    private boolean available = true;
    private boolean onLeave = false;

    private LocalDate leaveStartDate;
    private LocalDate leaveEndDate;

    @Column(length = 500)
    private String bio;

    private String password;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}