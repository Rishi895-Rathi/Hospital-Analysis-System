package com.example.demo.Controller;

import com.example.demo.model.Patient;
import com.example.demo.servic.PatientService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.PatternSyntaxException;

@RestController
@RequestMapping("api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/add")
    public ResponseEntity<Patient> addPatient(@Valid @RequestBody Patient patien){
        Patient saved = patientService.addPatient(patient);
        return new ResponseEntity<>(patient ,HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Patient>> getAllPatient(){
        List<Patient> patients = patientService.getAllPatients();
        return new ResponseEntity<>(patient , HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntityPatient> getPatientById(@PathVariable long id){
        Patient patients = patientService.getPatientById(id);
        return new ResponseEntity<>(patient , HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable long id , @Valid , @RequestBody Patient patient){
        Patient update = patientService.updatePatient(id , patient);
        return new ResponseEntity<>(update , HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return new ResponseEntity<>("Patient deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Patient> getPatientByEmail(@PathVariable String email) {
        Patient patient = patientService.getPatientByEmail(email);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @GetMapping("/disease/{disease}")
    public ResponseEntity<List<Patient>> getPatientsByDisease(@PathVariable String disease) {
        List<Patient> patients = patientService.getPatientsByDisease(disease);
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    @GetMapping("/bloodgroup/{bloodGroup}")
    public ResponseEntity<List<Patient>> getPatientsByBloodGroup(@PathVariable String bloodGroup) {
        List<Patient> patients = patientService.getPatientsByBloodGroup(bloodGroup);
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<Patient>> searchByName(@PathVariable String name) {
        List<Patient> patients = patientService.searchByName(name);
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }
}




// approach two

package com.example.demo.controller;

import com.example.demo.DTO.PatientResponseDTO;
import com.example.demo.model.Patient;
import com.example.demo.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

mport java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/add")
    public ResponseEntity<PatientResponseDTO> addPatient(@Valid @RequestBody Patient patient) {
        PatientResponseDTO saved = patientService.addPatient(patient);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
        List<PatientResponseDTO> patients = patientService.getAllPatients();
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable Long id) {
        PatientResponseDTO patient = patientService.getPatientById(id);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable Long id,
                                                            @Valid @RequestBody Patient patient) {
        PatientResponseDTO updated = patientService.updatePatient(id, patient);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return new ResponseEntity<>("Patient deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<PatientResponseDTO> getPatientByEmail(@PathVariable String email) {
        PatientResponseDTO patient = patientService.getPatientByEmail(email);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @GetMapping("/disease/{disease}")
    public ResponseEntity<List<PatientResponseDTO>> getPatientsByDisease(@PathVariable String disease) {
        List<PatientResponseDTO> patients = patientService.getPatientsByDisease(disease);
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    @GetMapping("/bloodgroup/{bloodGroup}")
    public ResponseEntity<List<PatientResponseDTO>> getPatientsByBloodGroup(@PathVariable String bloodGroup) {
        List<PatientResponseDTO> patients = patientService.getPatientsByBloodGroup(bloodGroup);
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<PatientResponseDTO>> searchByName(@PathVariable String name) {
        List<PatientResponseDTO> patients = patientService.searchByName(name);
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }
}
