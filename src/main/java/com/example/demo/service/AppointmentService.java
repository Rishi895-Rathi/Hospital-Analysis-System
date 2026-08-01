package com.example.demo.service;

import com.example.demo.DTO.AppointmentRequestDTO;
import com.example.demo.DTO.AppointmentResponseDTO;
import com.example.demo.model.Appointment;
import com.example.demo.model.Doctor;
import com.example.demo.model.Patient;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // ─── Convert Entity to DTO ────────────────────────────────
    private AppointmentResponseDTO toDTO(Appointment appointment) {
        return AppointmentResponseDTO.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatient().getPatient_id())
                .patientName(appointment.getPatient().getName())
                .patientEmail(appointment.getPatient().getEmail())
                .patientPhone(appointment.getPatient().getPhone())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .specialization(appointment.getDoctor().getSpecialization())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus().name())
                .reason(appointment.getReason())
                .build();
    }

    // ─── Suggest Doctors By Disease ──────────────────────────
    public List<Doctor> suggestDoctorsByDisease(String disease) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(disease);
    }

    // ─── Book Appointment ────────────────────────────────────
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO requestDTO) {
        Patient patient = patientRepository.findById(requestDTO.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient not found with id: " + requestDTO.getPatientId()));

        Doctor doctor = doctorRepository.findById(requestDTO.getDoctorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found with id: " + requestDTO.getDoctorId()));

        // Conflict Check — same doctor, same date, same time
        boolean conflict = appointmentRepository
                .existsByDoctor_IdAndAppointmentDateAndAppointmentTime(
                        requestDTO.getDoctorId(),
                        requestDTO.getAppointmentDate(),
                        requestDTO.getAppointmentTime()
                );

        if (conflict) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already has an appointment on " +
                            requestDTO.getAppointmentDate() + " at " +
                            requestDTO.getAppointmentTime()
            );
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(requestDTO.getAppointmentDate());
        appointment.setAppointmentTime(requestDTO.getAppointmentTime());
        appointment.setReason(requestDTO.getReason());

        Appointment saved = appointmentRepository.save(appointment);
        return toDTO(saved);
    }

    // ─── Get All Appointments ────────────────────────────────
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get By Patient ──────────────────────────────────────
    public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Get By Doctor ───────────────────────────────────────
    public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Cancel Appointment ──────────────────────────────────
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Appointment not found with id: " + id));
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    // ─── Confirm Appointment ─────────────────────────────────
    public void confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Appointment not found with id: " + id));
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
    }
}