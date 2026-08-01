package com.example.demo.service;

import com.example.demo.DTO.DoctorResponseDTO;
import com.example.demo.model.Doctor;
import com.example.demo.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    // ─── Convert Entity to DTO ────────────────────────────────
    private DoctorResponseDTO toDTO(Doctor doctor) {
        return DoctorResponseDTO.builder()
                .Doctor_id(doctor.getId())
                .name(doctor.getName())
                .specialization(doctor.getSpecialization())
                .email(doctor.getEmailId())
                .phone(String.valueOf(doctor.getContactNumber()))
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .build();
    }

    // ─── Add Doctor ──────────────────────────────────────────
    public DoctorResponseDTO addDoctor(Doctor doctor) {
        Doctor saved = doctorRepository.save(doctor);
        return toDTO(saved);
    }

    // ─── Get All Doctors ─────────────────────────────────────
    public List<DoctorResponseDTO> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get Doctor By ID ────────────────────────────────────
    public DoctorResponseDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found with id: " + id));
        return toDTO(doctor);
    }

    // ─── Update Doctor ───────────────────────────────────────
    public DoctorResponseDTO updateDoctor(Long id, Doctor updatedDoctor) {
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found with id: " + id));

        existing.setName(updatedDoctor.getName());
        existing.setEmailId(updatedDoctor.getEmailId());
        existing.setContactNumber(updatedDoctor.getContactNumber());
        existing.setSpecialization(updatedDoctor.getSpecialization());
        existing.setDepartment(updatedDoctor.getDepartment());
        existing.setAvailable(updatedDoctor.isAvailable());
        existing.setBio(updatedDoctor.getBio());

        Doctor saved = doctorRepository.save(existing);
        return toDTO(saved);
    }

    // ─── Delete Doctor ───────────────────────────────────────
    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    // ─── Get By Specialization ───────────────────────────────
    public List<DoctorResponseDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get By Department ───────────────────────────────────
    public List<DoctorResponseDTO> getDoctorsByDepartment(String department) {
        return doctorRepository.findByDepartment(department)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get Available Doctors ───────────────────────────────
    public List<DoctorResponseDTO> getAvailableDoctors() {
        return doctorRepository.findByAvailableTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}