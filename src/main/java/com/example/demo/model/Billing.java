package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "billing")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Patient_id;

    @Column(name="null")
    private String patientName;

    private double totalAmount;

    private double paidAmount;

    private double remainingAmount;

    private String paymentStatus; // PAID / PARTIAL / PENDING

    private String paymentMethod; // CASH / CARD / UPI
}