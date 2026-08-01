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
    private Long id;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "paid_amount")
    private Double paidAmount;

    @Column(name = "remaining_amount")
    private Double remainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    public enum PaymentStatus { PAID, PARTIAL, PENDING }
    public enum PaymentMethod { CASH, CARD, UPI }

    @PrePersist
    @PreUpdate
    public void calculateRemainingAmount() {
        if (totalAmount != null && paidAmount != null) {
            this.remainingAmount = this.totalAmount - this.paidAmount;
            if (this.paidAmount == 0) {
                this.paymentStatus = PaymentStatus.PENDING;
            } else if (this.remainingAmount <= 0) {
                this.paymentStatus = PaymentStatus.PAID;
            } else {
                this.paymentStatus = PaymentStatus.PARTIAL;
            }
        }
    }
}