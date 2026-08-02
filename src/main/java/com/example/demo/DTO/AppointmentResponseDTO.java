package com.example.demo.DTO;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponseDTO {

    // ─── Appointment Info ─────────────────────────────────────
    private Long appointmentId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
    private String reason;

    // postponed
    private LocalDate postponedDate;
    private LocalTime postponedTime;
    private String postponeReason;

    // ─── Patient Info ─────────────────────────────────────────
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    // ─── Doctor Info ──────────────────────────────────────────
    private Long doctorId;
    private String doctorName;
    private String specialization;
}