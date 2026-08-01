package com.example.demo.repository;

import com.example.demo.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {

    Optional<Billing> findByPatientName(String patientName);

    List<Billing> findByPaymentStatus(Billing.PaymentStatus paymentStatus);

    List<Billing> findByPaymentMethod(Billing.PaymentMethod paymentMethod);

    List<Billing> findByPatientNameContainingIgnoreCase(String patientName);
}