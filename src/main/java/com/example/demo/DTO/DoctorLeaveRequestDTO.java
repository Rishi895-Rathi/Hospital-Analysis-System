package com.example.demo.DTO;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorLeaveRequestDTO {

    private LocalDate leaveStartDate;
    private LocalDate leaveEndDate;

    // Postpone case mein — kitne din baad appointment reschedule ho
    private int postponeDays;
}