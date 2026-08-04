package com.example.demo.Controller;

import com.example.demo.model.Doctor;
import com.example.demo.model.Patient;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ─── Patient Register ─────────────────────────────────────
    @PostMapping("/patient/register")
    public ResponseEntity<Map<String, String>> patientRegister(
            @RequestBody Patient patient) {

        if (patientRepository.findByEmail(patient.getEmail()).isPresent()) {
            return new ResponseEntity<>(
                    Map.of("error", "Email already registered"),
                    HttpStatus.CONFLICT);
        }

        if (patientRepository.findByPhone(patient.getPhone()).isPresent()) {
            return new ResponseEntity<>(
                    Map.of("error", "Phone already registered"),
                    HttpStatus.CONFLICT);
        }

        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        Patient saved = patientRepository.save(patient);

        String token = jwtUtil.generateToken(saved.getEmail(), "PATIENT");

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "PATIENT");
        response.put("name", saved.getName());
        response.put("patientId", String.valueOf(saved.getPatient_id()));
        response.put("message", "Patient registered successfully!");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ─── Doctor Register ──────────────────────────────────────
    @PostMapping("/doctor/register")
    public ResponseEntity<Map<String, String>> doctorRegister(
            @RequestBody Doctor doctor) {

        if (doctorRepository.findByEmailId(doctor.getEmailId()).isPresent()) {
            return new ResponseEntity<>(
                    Map.of("error", "Email already registered"),
                    HttpStatus.CONFLICT);
        }

        if (doctorRepository.findByContactNumber(doctor.getContactNumber()).isPresent()) {
            return new ResponseEntity<>(
                    Map.of("error", "Phone already registered"),
                    HttpStatus.CONFLICT);
        }

        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        Doctor saved = doctorRepository.save(doctor);

        String token = jwtUtil.generateToken(saved.getEmailId(), "DOCTOR");

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "DOCTOR");
        response.put("name", saved.getName());
        response.put("doctorId", String.valueOf(saved.getId()));
        response.put("message", "Doctor registered successfully!");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ─── Patient Login ────────────────────────────────────────
    @PostMapping("/patient/login")
    public ResponseEntity<Map<String, String>> patientLogin(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        Optional<Patient> patient = patientRepository.findByEmail(email);

        if (patient.isEmpty() || !passwordEncoder.matches(
                password, patient.get().getPassword())) {
            return new ResponseEntity<>(
                    Map.of("error", "Invalid email or password"),
                    HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(email, "PATIENT");

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "PATIENT");
        response.put("name", patient.get().getName());
        response.put("patientId", String.valueOf(patient.get().getPatient_id()));

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ─── Doctor Login ─────────────────────────────────────────
    @PostMapping("/doctor/login")
    public ResponseEntity<Map<String, String>> doctorLogin(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        Optional<Doctor> doctor = doctorRepository.findByEmailId(email);

        if (doctor.isEmpty() || !passwordEncoder.matches(
                password, doctor.get().getPassword())) {
            return new ResponseEntity<>(
                    Map.of("error", "Invalid email or password"),
                    HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(email, "DOCTOR");

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "DOCTOR");
        response.put("name", doctor.get().getName());
        response.put("doctorId", String.valueOf(doctor.get().getId()));

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}