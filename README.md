Redis Integration
What is Redis?
Redis (Remote Dictionary Server) is an in-memory NoSQL data store used for caching, session storage, and message brokering.

Unlike PostgreSQL, which stores data on disk, Redis keeps data in RAM, making data retrieval extremely fast (typically in milliseconds).

In this project, Redis is used as a cache layer to reduce database queries and improve API response time.

Why Redis was used
The endpoints:

GET /api/doctor/all
GET /api/patient/all


are frequently accessed but don't change very often.

Without Redis:

Client
   │
   ▼
Spring Boot
   │
   ▼
PostgreSQL


Every request hits the database.

With Redis:

                Cache Hit
Client ─────► Spring Boot ─────► Redis
                  │                 ▲
                  │                 │
                  └────Cache Miss───┘
                          │
                          ▼
                    PostgreSQL


If data exists in Redis:

PostgreSQL is not queried.
Response is returned immediately.
Redis Setup
1. Docker Installation
docker pull redis


Run Redis:

docker run -d \
--name redis-server \
-p 6379:6379 \
redis


Verify:

docker ps


Output:

redis-server
6379->6379


Spring Boot Dependencies
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'


application.properties
spring.data.redis.host=localhost
spring.data.redis.port=6379


or

REDIS_HOST=localhost
REDIS_PORT=6379


using environment variables.

Enable Caching
@SpringBootApplication
@EnableCaching
public class DemoApplication {
}


Redis Configuration
A custom RedisConfig was created to:

configure cache manager
set cache TTL
use JSON serialization
support LocalDateTime serialization through JavaTimeModule
Example:

@Bean
public RedisCacheManager cacheManager(...) {
    ...
}


Caching Strategy
Doctor list

@Cacheable(value="doctors", key="#page + '-' + #size")
public Page<DoctorResponseDTO> getAllDoctors(...)


Patient list

@Cacheable(value="patients", key="#page + '-' + #size")
public Page<PatientResponseDTO> getAllPatients(...)


Cache Eviction
Whenever data changes, the cache is automatically cleared.

@CacheEvict(value="doctors", allEntries=true)


Used in

Add Doctor
Update Doctor
Delete Doctor
Similarly,

@CacheEvict(value="patients", allEntries=true)


is used for

Add Patient
Update Patient
Delete Patient
Cache Flow
First Request
GET /api/doctor/all

↓

Redis

↓

No Data (Cache Miss)

↓

PostgreSQL

↓

Result

↓

Store in Redis (5 minutes)

↓

Return Response


Second Request
GET /api/doctor/all

↓

Redis

↓

Cache Hit

↓

Return Cached Data

↓

No Database Query


After Update
PUT /api/doctor/update/5

↓

Database Updated

↓

@CacheEvict

↓

Doctor Cache Cleared

↓

Next GET Request

↓

Fresh Data Loaded


Cache TTL
Configured as

Duration.ofMinutes(5)


Meaning:

Cache expires automatically after 5 minutes.
The next request fetches fresh data from PostgreSQL and repopulates Redis.
Challenges Faced
While implementing Redis, cached responses containing LocalDateTime fields (createdAt, updatedAt) caused:

Could not write JSON:
Java 8 date/time type LocalDateTime not supported


Root Cause
The default GenericJackson2JsonRedisSerializer did not register the Java Time module, so it could not serialize or deserialize LocalDateTime.

Solution
Configured a custom ObjectMapper in RedisConfig:

ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(new JavaTimeModule());
mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

GenericJackson2JsonRedisSerializer serializer =
        new GenericJackson2JsonRedisSerializer(mapper);


This resolved the serialization issue and allowed cached DTOs containing LocalDateTime to be stored and retrieved correctly.

Benefits Achieved
Reduced repeated database queries
Faster API response times
Automatic cache invalidation after updates
Configurable cache expiration (5-minute TTL)
Transparent caching using Spring Cache annotations
Supports paginated responses
Handles Java 8 date/time serialization correctly



Redis Data Types
Redis supports these main data types:

Data Type	Description	Example
String	Text, JSON, numbers	"John"
Hash	Object with fields	{name:"John", age:25}
List	Ordered collection	["A","B","C"]


Example
Suppose the first request is

GET /api/doctor/all?page=0&size=10

Spring generates a cache key like:

doctors::0-10

because you wrote:

@Cacheable(value = "doctors", key = "#page + '-' + #size")

Redis stores something like:

Key

doctors::0-10

Value

{
  "@class":"org.springframework.data.domain.PageImpl",
  "content":[
    {
      "id":1,
      "name":"Dr. Amit",
      "specialization":"Cardiology",
      "department":"Heart",
      "available":true,
      "createdAt":"2026-08-07T15:20:10",
      "updatedAt":"2026-08-07T15:20:10"
    },
    {
      "id":2,
      "name":"Dr. Rahul",
      "specialization":"Neurology",
      "department":"Brain",
      "available":false,
      "createdAt":"2026-08-06T12:15:20",
      "updatedAt":"2026-08-06T12:15:20"
    }
  ],
  "totalElements":2,
  "totalPages":1
}

Why did you need JavaTimeModule?  or we can say this as what is the use of that??

private LocalDateTime createdAt;
private LocalDateTime updatedAt;

When Spring tried to convert your object to JSON for Redis, the default Jackson configuration didn't know how to serialize LocalDateTime, causing the error you saw.

By registering:

objectMapper.registerModule(new JavaTimeModule());

Jackson can serialize and deserialize LocalDateTime correctly, allowing those DTOs to be cached and retrieved without errors.




PROJECT STRUCTURE : ->

════════════════════════════════════════════════════
   HOSPITAL MANAGEMENT SYSTEM — PROJECT SUMMARY
════════════════════════════════════════════════════

TECH STACK:
  Language:    Java 17
  Framework:   Spring Boot 3.2.5
  Database:    PostgreSQL (port 5432)
  Cache:       Redis (Docker, port 6379)
  Security:    JWT Authentication
  Build:       Gradle
  API Docs:    Swagger UI
  Port:        8081

════════════════════════════════════════════════════
PROJECT STRUCTURE:
════════════════════════════════════════════════════

com.example.demo
├── Controller/                    ← Capital C (important!)
│   ├── AppointmentController.java
│   ├── AuthController.java
│   ├── BillingController.java
│   ├── DoctorController.java
│   └── PatientController.java
├── DTO/
│   ├── AppointmentRequestDTO.java
│   ├── AppointmentResponseDTO.java
│   ├── BillingResponseDTO.java
│   ├── DoctorLeaveRequestDTO.java
│   ├── DoctorResponseDTO.java
│   ├── PatientRequestDTO.java
│   └── PatientResponseDTO.java
├── model/
│   ├── Appointment.java
│   ├── Billing.java
│   ├── Doctor.java
│   └── Patient.java
├── repository/
│   ├── AppointmentRepository.java
│   ├── BillingRepository.java
│   ├── DoctorRepository.java
│   └── PatientRepository.java
├── security/
│   ├── JwtFilter.java
│   └── JwtUtil.java
├── service/
│   ├── AppointmentService.java
│   ├── BillingService.java
│   ├── DoctorService.java      ← @Cacheable/@CacheEvict added
│   └── PatientService.java     ← @Cacheable/@CacheEvict added
├── AppConfig.java               ← PasswordEncoder + Redis exclude
├── DemoApplication.java         ← @EnableCaching added
├── GlobalExceptionHandler.java
├── RedisConfig.java             
└── SecurityConfig.java

════════════════════════════════════════════════════
DATABASE:
════════════════════════════════════════════════════

PostgreSQL DB: hospital_db
Tables:
  - patients      (patient_id, name, age, email, phone,
                   password, disease, bloodGroup, address,
                   createdAt, updatedAt)
  - doctors       (id, name, emailId, contactNumber,
                   specialization, department, available,
                   onLeave, leaveStartDate, leaveEndDate,
                   bio, password, createdAt, updatedAt)
  - appointments  (id, patient_id, doctor_id, appointmentDate,
                   appointmentTime, status, reason,
                   postponedDate, postponedTime,
                   postponeReason, createdAt)
  - billing       (id, patientName, totalAmount, paidAmount,
                   remainingAmount, paymentStatus,
                   paymentMethod)

════════════════════════════════════════════════════
SECURITY:
════════════════════════════════════════════════════

JWT Token — 24hr expiry
Roles: DOCTOR, PATIENT

Public endpoints:
  /api/auth/**
  /swagger-ui/**
  /api-docs/**

DOCTOR can access:
  - All patient list
  - All appointments
  - Confirm/Cancel appointments
  - Billing management
  - Doctor CRUD
  - Apply leave/return

PATIENT can access:
  - Book appointment
  - View own appointments
  - View doctors list
  - View own profile

════════════════════════════════════════════════════
ENV FILE (.env):
════════════════════════════════════════════════════

DB_URL=jdbc:postgresql://localhost:5432/hospital_db
DB_USERNAME=postgres
DB_PASSWORD=rishi
JWT_SECRET=hospital_management_super_secret_key_2026
JWT_EXPIRATION=86400000
REDIS_HOST=localhost
REDIS_PORT=6379

════════════════════════════════════════════════════
REDIS:
════════════════════════════════════════════════════

Docker container: redis-server
Port: 6379
Cache:
  - "doctors"  → getAllDoctors (5 min TTL)
  - "patients" → getAllPatients (5 min TTL)
Cache evict on: add, update, delete

════════════════════════════════════════════════════
COMPLETED FEATURES:
════════════════════════════════════════════════════

✅ Patient CRUD
✅ Doctor CRUD
✅ Appointment booking with conflict check
✅ Doctor leave/return
✅ Auto appointment shift when doctor leaves
✅ Auto appointment postpone when no doctor available
✅ Billing management (PAID/PARTIAL/PENDING auto calc)
✅ JWT Authentication (DOCTOR + PATIENT roles)
✅ Role based access control
✅ Pagination (page, size params)
✅ Global Exception Handler
✅ Swagger UI
✅ .env file for secrets
✅ application-example.properties
✅ Redis caching (Doctor + Patient list)
✅ GitHub push
✅ README.md

════════════════════════════════════════════════════
PENDING:
════════════════════════════════════════════════════

🔄 Redis Internal Server Error fix (done completed)
❌ Docker containerization 
❌ Frontend ( either gonna use ai or make it own)

════════════════════════════════════════════════════
KEY API ENDPOINTS:
════════════════════════════════════════════════════

AUTH (Public):
  POST /api/auth/doctor/register
  POST /api/auth/patient/register
  POST /api/auth/doctor/login
  POST /api/auth/patient/login

DOCTOR:
  GET    /api/doctor/all?page=0&size=10
  GET    /api/doctor/{id}
  PUT    /api/doctor/update/{id}
  DELETE /api/doctor/delete/{id}
  PUT    /api/doctor/leave/{id}
  PUT    /api/doctor/return/{id}
  GET    /api/doctor/available

PATIENT:
  GET    /api/patient/all?page=0&size=10
  GET    /api/patient/{id}
  PUT    /api/patient/update/{id}
  DELETE /api/patient/delete/{id}
  GET    /api/patient/search/{name}

APPOINTMENT:
  POST   /api/appointment/book
  GET    /api/appointment/all
  GET    /api/appointment/suggest-doctors/{disease}
  GET    /api/appointment/patient/{patientId}
  PUT    /api/appointment/confirm/{id}
  PUT    /api/appointment/cancel/{id}

BILLING:
  POST   /api/billing/add
  GET    /api/billing/all
  PUT    /api/billing/update/{patientId}
  DELETE /api/billing/delete/{patientId}

════════════════════════════════════════════════════
URLS:
════════════════════════════════════════════════════

App:     http://localhost:8081
Swagger: http://localhost:8081/swagger-ui.html
API Doc: http://localhost:8081/api-docs




DATA BASE DESIGN 
## 🗄️ Database Design

### Overview
The Hospital Management System uses **PostgreSQL** as the primary relational database.
The schema consists of 4 core tables with proper relationships, constraints, and indexes.

---

### Entity Relationship Diagram
Patient (1) -------- (M) Appointments
Doctor  (1) -------- (M) Appointments
Patient (1) -------- (M) Billing
### Tables

#### 1. `patients`
Stores all patient information — both registered users and walk-in patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `patient_id` | BIGSERIAL | PRIMARY KEY | Auto-generated unique ID |
| `name` | VARCHAR | NOT NULL | Patient full name |
| `age` | INTEGER | NOT NULL | Patient age |
| `email` | VARCHAR | UNIQUE, NOT NULL | Login email |
| `phone` | VARCHAR | UNIQUE | Contact number |
| `password` | VARCHAR | | BCrypt encoded password |
| `disease` | VARCHAR | | Primary disease/complaint |
| `blood_group` | VARCHAR | | Blood group (A+, B+, etc.) |
| `address` | VARCHAR(500) | | Patient address |
| `created_at` | TIMESTAMP | | Auto-set on creation |
| `updated_at` | TIMESTAMP | | Auto-set on update |

---

#### 2. `doctors`
Stores doctor profiles, specializations, availability, and leave information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-generated unique ID |
| `name` | VARCHAR | NOT NULL | Doctor full name |
| `email_id` | VARCHAR | UNIQUE, NOT NULL | Login email |
| `contact_number` | BIGINT | UNIQUE | Contact number |
| `specialization` | VARCHAR | NOT NULL | Medical specialization |
| `department` | VARCHAR | NOT NULL | Hospital department |
| `available` | BOOLEAN | DEFAULT true | Current availability |
| `on_leave` | BOOLEAN | DEFAULT false | Leave status |
| `leave_start_date` | DATE | | Leave start date |
| `leave_end_date` | DATE | | Leave end date |
| `bio` | VARCHAR(500) | | Doctor biography |
| `password` | VARCHAR | | BCrypt encoded password |
| `created_at` | TIMESTAMP | | Auto-set on creation |
| `updated_at` | TIMESTAMP | | Auto-set on update |

---

#### 3. `appointments`
Central table managing all patient-doctor appointments with status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-generated unique ID |
| `patient_id` | BIGINT | FK → patients | Reference to patient |
| `doctor_id` | BIGINT | FK → doctors | Reference to doctor |
| `appointment_date` | DATE | NOT NULL | Scheduled date |
| `appointment_time` | TIME | NOT NULL | Scheduled time |
| `status` | VARCHAR | ENUM | PENDING/CONFIRMED/CANCELLED/COMPLETED/POSTPONED |
| `reason` | VARCHAR | | Reason for visit |
| `postponed_date` | DATE | | New date if postponed |
| `postponed_time` | TIME | | New time if postponed |
| `postpone_reason` | VARCHAR | | Reason for postponement |
| `created_at` | TIMESTAMP | | Auto-set on creation |

---

#### 4. `billing`
Tracks all financial transactions for patient treatments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-generated unique ID |
| `patient_name` | VARCHAR | NOT NULL | Patient name |
| `total_amount` | FLOAT | | Total bill amount |
| `paid_amount` | FLOAT | | Amount paid |
| `remaining_amount` | FLOAT | | Auto-calculated remaining |
| `payment_status` | VARCHAR | ENUM | PAID/PARTIAL/PENDING |
| `payment_method` | VARCHAR | ENUM | CASH/CARD/UPI |

---

### Relationships

| Relationship | Type | Description |
|---|---|---|
| Patient → Appointments | One-to-Many | One patient can have multiple appointments |
| Doctor → Appointments | One-to-Many | One doctor can have multiple appointments |
| Patient → Billing | One-to-Many | One patient can have multiple bills |

---

### Business Logic in Database

#### Auto-calculations
```sql
-- remainingAmount auto-calculated on save
remaining_amount = total_amount - paid_amount

-- paymentStatus auto-set based on amounts
IF paid_amount = 0        → PENDING
IF remaining_amount <= 0  → PAID
ELSE                      → PARTIAL
```

#### Appointment Status Flow

PENDING → CONFIRMED → COMPLETED
↓
CANCELLED

PENDING → POSTPONED → PENDING (when doctor returns)


#### Doctor Leave Flow

Doctor applies leave
↓
Find available doctor with same specialization
↓
Found?
/
Yes No
↓ ↓
Shift Postpone
appointments appointments
(same date) (new date)


---

### Constraints & Validations

| Rule | Implementation |
|---|---|
| Unique email per patient | `@Column(unique = true)` |
| Unique phone per patient | `@Column(unique = true)` |
| Unique email per doctor | `@Column(unique = true)` |
| Unique phone per doctor | `@Column(unique = true)` |
| No double booking | `existsByDoctor_IdAndAppointmentDateAndAppointmentTime` |
| Password encrypted | BCrypt encoding |

---

### Caching Strategy (Redis)

| Cache | Key Pattern | TTL | Eviction |
|---|---|---|---|
| `doctors` | `page-size` | 5 min | On add/update/delete |
| `patients` | `page-size` | 5 min | On add/update/delete |
