package com.example.demo.service;

import com.example.demo.DTO.DoctorLeaveRequestDTO;
import com.example.demo.DTO.DoctorResponseDTO;
import com.example.demo.model.Appointment;
import com.example.demo.model.Doctor;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

//pagination classes and library
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        if (doctorRepository.findByEmailId(doctor.getEmailId()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already registered: " + doctor.getEmailId());
        }
        if (doctorRepository.findByContactNumber(doctor.getContactNumber()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Phone already registered: " + doctor.getContactNumber());
        }
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        Doctor saved = doctorRepository.save(doctor);
        return toDTO(saved);
    }

    // ─── Get All Doctors ─────────────────────────────────────
//    public List<DoctorResponseDTO> getAllDoctors() {
//        return doctorRepository.findAll()
//                .stream()
//                .map(this::toDTO)
//                .collect(Collectors.toList());
//    }

    //pagination added here last one don't have pagination
    public Page<DoctorResponseDTO> getAllDoctors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return doctorRepository.findAll(pageable)
                .map(this::toDTO);
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

    // ─── Delete Doctor + Shift Appointments ──────────────────
    public void deleteDoctor(Long id) {
        Doctor deletedDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found with id: " + id));

        List<Doctor> sameDoctors = doctorRepository
                .findBySpecializationContainingIgnoreCase(deletedDoctor.getSpecialization())
                .stream()
                .filter(d -> !d.getId().equals(id) && d.isAvailable() && !d.isOnLeave())
                .collect(Collectors.toList());

        List<Appointment> appointments = appointmentRepository.findByDoctorId(id);

        if (!appointments.isEmpty()) {
            if (sameDoctors.isEmpty()) {
                appointments.forEach(a ->
                        a.setStatus(Appointment.AppointmentStatus.CANCELLED));
                appointmentRepository.saveAll(appointments);
            } else {
                Doctor alternativeDoctor = sameDoctors.get(0);
                appointments.forEach(a -> a.setDoctor(alternativeDoctor));
                appointmentRepository.saveAll(appointments);
            }
        }

        doctorRepository.deleteById(id);
    }

    // ─── Doctor Leave ─────────────────────────────────────────
    public String applyLeave(Long doctorId, DoctorLeaveRequestDTO leaveRequest) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found with id: " + doctorId));

        //Doctor ko leave pe mark karo
        doctor.setOnLeave(true);
        doctor.setAvailable(false);
        doctor.setLeaveStartDate(leaveRequest.getLeaveStartDate());
        doctor.setLeaveEndDate(leaveRequest.getLeaveEndDate());
        doctorRepository.save(doctor);

        //Doctor ki appointments fetch karo
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);

        //Same specialization ka available doctor dhundo
        List<Doctor> availableDoctors = doctorRepository
                .findBySpecializationContainingIgnoreCase(doctor.getSpecialization())
                .stream()
                .filter(d -> !d.getId().equals(doctorId) && d.isAvailable() && !d.isOnLeave())
                .collect(Collectors.toList());

        int shiftedCount = 0;
        int postponedCount = 0;

        for (Appointment appointment : appointments) {
            if (appointment.getStatus() == Appointment.AppointmentStatus.PENDING ||
                    appointment.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {

                if (!availableDoctors.isEmpty()) {
                    //Alternative doctor mila — shift karo
                    Doctor alternativeDoctor = availableDoctors.get(0);
                    appointment.setDoctor(alternativeDoctor);
                    appointment.setStatus(Appointment.AppointmentStatus.PENDING);
                    shiftedCount++;
                } else {
                    //Koi doctor nahi — postpone karo
                    appointment.setStatus(Appointment.AppointmentStatus.POSTPONED);
                    appointment.setPostponedDate(
                            appointment.getAppointmentDate()
                                    .plusDays(leaveRequest.getPostponeDays()));
                    appointment.setPostponedTime(appointment.getAppointmentTime());
                    appointment.setPostponeReason(
                            "Dr. " + doctor.getName() + " is on leave from " +
                                    leaveRequest.getLeaveStartDate() + " to " +
                                    leaveRequest.getLeaveEndDate());
                    postponedCount++;
                }
            }
        }

        appointmentRepository.saveAll(appointments);

        return "Leave applied successfully! " +
                shiftedCount + " appointments shifted, " +
                postponedCount + " appointments postponed.";
    }

    // ─── Doctor Return From Leave ─────────────────────────────
    public String returnFromLeave(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found with id: " + doctorId));

        //Doctor wapas available karo
        doctor.setOnLeave(false);
        doctor.setAvailable(true);
        doctor.setLeaveStartDate(null);
        doctor.setLeaveEndDate(null);
        doctorRepository.save(doctor);

        //Postponed appointments wapas restore karo
        List<Appointment> postponedAppointments = appointmentRepository
                .findByDoctorId(doctorId)
                .stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.POSTPONED)
                .collect(Collectors.toList());

        for (Appointment appointment : postponedAppointments) {
            if (appointment.getPostponedDate() != null) {
                appointment.setAppointmentDate(appointment.getPostponedDate());
                appointment.setAppointmentTime(appointment.getPostponedTime());
                appointment.setPostponedDate(null);
                appointment.setPostponedTime(null);
                appointment.setPostponeReason(null);
            }
            appointment.setStatus(Appointment.AppointmentStatus.PENDING);
            appointment.setDoctor(doctor);
        }

        appointmentRepository.saveAll(postponedAppointments);

        return "Doctor " + doctor.getName() + " is back! " +
                postponedAppointments.size() + " appointments restored.";
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