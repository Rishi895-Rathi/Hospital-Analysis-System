package com.example.demo.service;

import com.example.demo.DTO.PatientResponseDTO;
import com.example.demo.model.Appointment;
import com.example.demo.model.Patient;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ─── Convert Entity to DTO ────────────────────────────────
    private PatientResponseDTO toDTO(Patient patient) {
        return PatientResponseDTO.builder()
                .Patient_id(patient.getPatient_id())
                .name(patient.getName())
                .age(patient.getAge())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .disease(patient.getDisease())
                .bloodGroup(patient.getBloodGroup())
                .address(patient.getAddress())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .build();
    }

    // ─── Add Patient ─────────────────────────────────────────
    public PatientResponseDTO addPatient(Patient patient) {
        Patient saved = patientRepository.save(patient);
        return toDTO(saved);
    }

    // ─── Get All Patients ────────────────────────────────────
    public List<PatientResponseDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get Patient By ID ───────────────────────────────────
    public PatientResponseDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient not found with id: " + id));
        return toDTO(patient);
    }

    // ─── Update Patient ──────────────────────────────────────
    public PatientResponseDTO updatePatient(Long id, Patient updatedPatient) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient not found with id: " + id));

        existing.setName(updatedPatient.getName());
        existing.setAge(updatedPatient.getAge());
        existing.setEmail(updatedPatient.getEmail());
        existing.setPhone(updatedPatient.getPhone());
        existing.setDisease(updatedPatient.getDisease());
        existing.setBloodGroup(updatedPatient.getBloodGroup());
        existing.setAddress(updatedPatient.getAddress());

        Patient saved = patientRepository.save(existing);
        return toDTO(saved);
    }

    // ─── Delete Patient + Cancel Appointments ────────────────
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Patient not found with id: " + id);
        }

        //Patient ki saari appointments cancel karo
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);
        if (!appointments.isEmpty()) {
            appointments.forEach(a ->
                    a.setStatus(Appointment.AppointmentStatus.CANCELLED));
            appointmentRepository.saveAll(appointments);
        }

        //Phir patient delete karo
        patientRepository.deleteById(id);
    }

    // ─── Get By Email ─────────────────────────────────────────
    public PatientResponseDTO getPatientByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient not found with email: " + email));
        return toDTO(patient);
    }

    // ─── Get By Disease ──────────────────────────────────────
    public List<PatientResponseDTO> getPatientsByDisease(String disease) {
        return patientRepository.findByDisease(disease)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get By Blood Group ──────────────────────────────────
    public List<PatientResponseDTO> getPatientsByBloodGroup(String bloodGroup) {
        return patientRepository.findByBloodGroup(bloodGroup)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Search By Name ──────────────────────────────────────
    public List<PatientResponseDTO> searchByName(String name) {
        return patientRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}