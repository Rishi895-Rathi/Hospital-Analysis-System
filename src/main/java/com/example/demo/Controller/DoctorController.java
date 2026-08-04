package com.example.demo.Controller;

import com.example.demo.DTO.DoctorLeaveRequestDTO;
import com.example.demo.DTO.DoctorResponseDTO;
import com.example.demo.model.Doctor;
import com.example.demo.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping("/add")
    public ResponseEntity<DoctorResponseDTO> addDoctor(@RequestBody Doctor doctor) {
        DoctorResponseDTO saved = doctorService.addDoctor(doctor);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<DoctorResponseDTO>> getAllDoctors() {
        List<DoctorResponseDTO> doctors = doctorService.getAllDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable Long id) {
        DoctorResponseDTO doctor = doctorService.getDoctorById(id);
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<DoctorResponseDTO> updateDoctor(@PathVariable Long id,
                                                          @RequestBody Doctor doctor) {
        DoctorResponseDTO updated = doctorService.updateDoctor(id, doctor);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return new ResponseEntity<>("Doctor deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorResponseDTO>> getDoctorsBySpecialization(
            @PathVariable String specialization) {
        List<DoctorResponseDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<DoctorResponseDTO>> getDoctorsByDepartment(
            @PathVariable String department) {
        List<DoctorResponseDTO> doctors = doctorService.getDoctorsByDepartment(department);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @GetMapping("/available")
    public ResponseEntity<List<DoctorResponseDTO>> getAvailableDoctors() {
        List<DoctorResponseDTO> doctors = doctorService.getAvailableDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    //Leave apply karo
    @PutMapping("/leave/{id}")
    public ResponseEntity<String> applyLeave(@PathVariable Long id,
                                             @RequestBody DoctorLeaveRequestDTO leaveRequest) {
        String message = doctorService.applyLeave(id, leaveRequest);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    //Leave se wapas aao
    @PutMapping("/return/{id}")
    public ResponseEntity<String> returnFromLeave(@PathVariable Long id) {
        String message = doctorService.returnFromLeave(id);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}