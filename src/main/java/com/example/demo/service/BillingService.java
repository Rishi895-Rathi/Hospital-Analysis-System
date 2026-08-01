package com.example.demo.service;

import com.example.demo.DTO.BillingResponseDTO;
import com.example.demo.model.Billing;
import com.example.demo.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingService {

    @Autowired
    private BillingRepository billingRepository;

    // ─── Convert Entity to DTO ────────────────────────────────
    private BillingResponseDTO toDTO(Billing billing) {
        return BillingResponseDTO.builder()
                .patientName(billing.getPatientName())
                .totalAmount(billing.getTotalAmount())
                .paidAmount(billing.getPaidAmount())
                .remainingAmount(billing.getRemainingAmount())
                .paymentStatus(billing.getPaymentStatus().name())
                .paymentMethod(billing.getPaymentMethod().name())
                .build();
    }

    // ─── Add Billing ─────────────────────────────────────────
    public BillingResponseDTO addBilling(Billing billing) {
        Billing saved = billingRepository.save(billing);
        return toDTO(saved);
    }

    // ─── Get All Billings ────────────────────────────────────
    public List<BillingResponseDTO> getAllBillings() {
        return billingRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get Billing By Patient ID ───────────────────────────
    public BillingResponseDTO getBillingByPatientId(Long id) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Billing not found with id: " + id));
        return toDTO(billing);
    }

    // ─── Update Billing ──────────────────────────────────────
    public BillingResponseDTO updateBilling(Long id, Billing updatedBilling) {
        Billing existing = billingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Billing not found with id: " + id));

        existing.setPatientName(updatedBilling.getPatientName());
        existing.setTotalAmount(updatedBilling.getTotalAmount());
        existing.setPaidAmount(updatedBilling.getPaidAmount());
        existing.setPaymentMethod(updatedBilling.getPaymentMethod());

        Billing saved = billingRepository.save(existing);
        return toDTO(saved);
    }

    // ─── Delete Billing ──────────────────────────────────────
    public void deleteBilling(Long id) {
        if (!billingRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Billing not found with id: " + id);
        }
        billingRepository.deleteById(id);
    }

    // ─── Get By Payment Status ───────────────────────────────
    public List<BillingResponseDTO> getBillingByPaymentStatus(String status) {
        Billing.PaymentStatus paymentStatus = Billing.PaymentStatus.valueOf(status.toUpperCase());
        return billingRepository.findByPaymentStatus(paymentStatus)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get By Payment Method ───────────────────────────────
    public List<BillingResponseDTO> getBillingByPaymentMethod(String method) {
        Billing.PaymentMethod paymentMethod = Billing.PaymentMethod.valueOf(method.toUpperCase());
        return billingRepository.findByPaymentMethod(paymentMethod)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get By Patient Name ─────────────────────────────────
    public List<BillingResponseDTO> getBillingByPatientName(String name) {
        return billingRepository.findByPatientNameContainingIgnoreCase(name)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}