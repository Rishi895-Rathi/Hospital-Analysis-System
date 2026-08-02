package com.example.demo.repository;

import com.example.demo.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmailId(String emailId);

    Optional<Doctor> findByContactNumber(Long contactNumber);

    List<Doctor> findBySpecialization(String specialization);

    List<Doctor> findByDepartment(String department);

    List<Doctor> findByAvailableTrue();

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
}