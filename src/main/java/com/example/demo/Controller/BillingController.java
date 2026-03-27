package com.example.demo.Controller;

import com.example.demo.DTO.BillingResponseDTO;
import com.example.demo.model.Billing;
import com.example.demo.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private BillingService billingService;

    // ─── Add Billing ─────────────────────────────────────────
    @PostMapping("/add")
    public ResponseEntity<BillingResponseDTO> addBilling(@RequestBody Billing billing) {
        BillingResponseDTO saved = billingService.addBilling(billing);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ─── Get All Billings ────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<List<BillingResponseDTO>> getAllBillings() {
        List<BillingResponseDTO> billings = billingService.getAllBillings();
        return new ResponseEntity<>(billings, HttpStatus.OK);
    }

    // ─── Get Billing By Patient ID ───────────────────────────
    @GetMapping("/{patientId}")
    public ResponseEntity<BillingResponseDTO> getBillingByPatientId(@PathVariable Long patientId) {
        BillingResponseDTO billing = billingService.getBillingByPatientId(patientId);
        return new ResponseEntity<>(billing, HttpStatus.OK);
    }

    // ─── Update Billing ──────────────────────────────────────
    @PutMapping("/update/{patientId}")
    public ResponseEntity<BillingResponseDTO> updateBilling(@PathVariable Long patientId,
                                                            @RequestBody Billing billing) {
        BillingResponseDTO updated = billingService.updateBilling(patientId, billing);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // ─── Delete Billing ──────────────────────────────────────
    @DeleteMapping("/delete/{patientId}")
    public ResponseEntity<String> deleteBilling(@PathVariable Long patientId) {
        billingService.deleteBilling(patientId);
        return new ResponseEntity<>("Billing deleted successfully", HttpStatus.OK);
    }

    // ─── Get Billing By Payment Status ───────────────────────
    @GetMapping("/status/{paymentStatus}")
    public ResponseEntity<List<BillingResponseDTO>> getBillingByPaymentStatus(
            @PathVariable String paymentStatus) {
        List<BillingResponseDTO> billings = billingService.getBillingByPaymentStatus(paymentStatus);
        return new ResponseEntity<>(billings, HttpStatus.OK);
    }

    // ─── Get Billing By Payment Method ───────────────────────
    @GetMapping("/method/{paymentMethod}")
    public ResponseEntity<List<BillingResponseDTO>> getBillingByPaymentMethod(
            @PathVariable String paymentMethod) {
        List<BillingResponseDTO> billings = billingService.getBillingByPaymentMethod(paymentMethod);
        return new ResponseEntity<>(billings, HttpStatus.OK);
    }

    // ─── Get Billing By Patient Name ─────────────────────────
    @GetMapping("/patient/{patientName}")
    public ResponseEntity<List<BillingResponseDTO>> getBillingByPatientName(
            @PathVariable String patientName) {
        List<BillingResponseDTO> billings = billingService.getBillingByPatientName(patientName);
        return new ResponseEntity<>(billings, HttpStatus.OK);
    }
}