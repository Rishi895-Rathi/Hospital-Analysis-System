package com.example.demo.Controller;

import com.example.demo.DTO.AppointmentRequestDTO;
import com.example.demo.DTO.AppointmentResponseDTO;
import com.example.demo.model.Doctor;
import com.example.demo.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/suggest-doctors/{disease}")
    public ResponseEntity<List<Doctor>> suggestDoctors(@PathVariable String disease) {
        List<Doctor> doctors = appointmentService.suggestDoctorsByDisease(disease);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @PostMapping("/book")
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(
            @Valid @RequestBody AppointmentRequestDTO requestDTO) {
        AppointmentResponseDTO response = appointmentService.bookAppointment(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPatient(
            @PathVariable Long patientId) {
        List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByPatient(patientId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDoctor(
            @PathVariable Long doctorId) {
        List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long appointmentId) {
        appointmentService.cancelAppointment(appointmentId);
        return new ResponseEntity<>("Appointment cancelled successfully", HttpStatus.OK);
    }

    @PutMapping("/confirm/{appointmentId}")
    public ResponseEntity<String> confirmAppointment(@PathVariable Long appointmentId) {
        appointmentService.confirmAppointment(appointmentId);
        return new ResponseEntity<>("Appointment confirmed successfully", HttpStatus.OK);
    }
}