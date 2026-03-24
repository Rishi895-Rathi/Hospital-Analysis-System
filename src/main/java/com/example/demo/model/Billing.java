package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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

    @NotNull(message = "Patient name cannot be null")
    @NotBlank(message = "Patient name cannot be blank")
    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @NotNull(message = "Total amount cannot be null")
    @Positive(message = "Total amount must be greater than 0")
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @NotNull(message = "Paid amount cannot be null")
    @Column(name = "paid_amount", nullable = false)
    private Double paidAmount;

    @Column(name = "remaining_amount")
    private Double remainingAmount;

    @NotNull(message = "Payment status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @NotNull(message = "Payment method cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    // ─── Enums ───────────────────────────────────────────────
    public enum PaymentStatus { PAID, PARTIAL, PENDING }
    public enum PaymentMethod { CASH, CARD, UPI }

    // ─── Auto-calculate remainingAmount before saving ────────
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