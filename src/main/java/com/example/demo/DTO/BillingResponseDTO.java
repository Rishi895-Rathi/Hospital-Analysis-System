package com.example.demo.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingResponseDTO {

    private Long Patient_id;

    private Long patientId;
    private String patientName;

    private double totalAmount;
    private double paidAmount;
    private double remainingAmount;

    private String paymentStatus;
    private String paymentMethod;
}