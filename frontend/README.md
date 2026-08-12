# Care Connect Hub

Build a complete Hospital Management System frontend using React.js with Tailwind CSS.

## Backend API
Base URL: http://localhost:8081
Authentication: JWT Bearer Token

## Color Theme
- Primary: Blue (#2563EB)
- Secondary: White (#FFFFFF)
- Accent: Green (#16A34A) for success, Red (#DC2626) for danger
- Background: Light Gray (#F3F4F6)

## Pages & Features

### 1. Login Page
- Two options: "Login as Doctor" and "Login as Patient"
- Email and Password fields
- JWT token stored in localStorage
- Redirect to respective dashboard after login

### 2. Register Page
- Two tabs: Doctor Register | Patient Register
- Doctor fields: name, emailId, contactNumber, specialization, department, bio, password
- Patient fields: name, age, email, phone, disease, bloodGroup, address, password

### 3. Doctor Dashboard
After login doctor can see:
- Total patients count
- Total appointments count
- Recent appointments list
- Navigation to all features

### 4. Patient Dashboard
After login patient can see:
- Their appointments list
- Book new appointment option
- Their profile

### 5. Doctor Management (Doctor only)
- List all doctors with pagination (page, size params)
- Search by specialization
- Update doctor profile
- Delete doctor (show warning modal)
- Apply Leave button (with date picker for start/end date)
- Return from Leave button

### 6. Patient Management (Doctor only)
- List all patients with pagination
- Search by name
- Filter by disease and blood group
- View patient details
- Delete patient

### 7. Appointment Booking (Both roles)
Step 1: Enter disease
Step 2: GET /api/appointment/suggest-doctors/{disease} → Show doctor list
Step 3: Select doctor
Step 4: Fill date, time, reason
Step 5: POST /api/appointment/book with JWT token

### 8. Appointment Management
- Doctor sees all appointments
- Patient sees only their appointments
- Status badges: PENDING=yellow, CONFIRMED=green, CANCELLED=red, POSTPONED=orange, COMPLETED=blue
- Confirm/Cancel buttons (Doctor only)

### 9. Billing Management (Doctor only)
- List all billings
- Add billing: patientName, totalAmount, paidAmount, paymentMethod (CASH/CARD/UPI)
- Payment status auto-calculated: PAID/PARTIAL/PENDING
- Filter by status and method

## API Endpoints

### Auth (Public)
POST /api/auth/patient/register
POST /api/auth/doctor/register
POST /api/auth/patient/login
POST /api/auth/doctor/login

### Doctor
GET /api/doctor/all?page=0&size=10
GET /api/doctor/{id}
PUT /api/doctor/update/{id}
DELETE /api/doctor/delete/{id}
PUT /api/doctor/leave/{id} → body: {leaveStartDate, leaveEndDate, postponeDays}
PUT /api/doctor/return/{id}
GET /api/doctor/available
GET /api/doctor/specialization/{specialization}

### Patient
GET /api/patient/all?page=0&size=10
GET /api/patient/{id}
PUT /api/patient/update/{id}
DELETE /api/patient/delete/{id}
GET /api/patient/search/{name}
GET /api/patient/disease/{disease}
GET /api/patient/bloodgroup/{bloodGroup}

### Appointment
POST /api/appointment/book
GET /api/appointment/all
GET /api/appointment/suggest-doctors/{disease}
GET /api/appointment/patient/{patientId}
GET /api/appointment/doctor/{doctorId}
PUT /api/appointment/confirm/{id}
PUT /api/appointment/cancel/{id}

### Billing
POST /api/billing/add
GET /api/billing/all
PUT /api/billing/update/{patientId}
DELETE /api/billing/delete/{patientId}
GET /api/billing/status/{paymentStatus}
GET /api/billing/method/{paymentMethod}

## Request Bodies

### Doctor Register
{
  "name": "Dr. Sharma",
  "emailId": "sharma@hospital.com",
  "contactNumber": 9876543210,
  "specialization": "Cardiology",
  "department": "Heart",
  "available": true,
  "bio": "Senior Cardiologist",
  "password": "doctor123"
}

### Patient Register
{
  "name": "Rahul Kumar",
  "age": 25,
  "email": "rahul@gmail.com",
  "phone": "9876543210",
  "password": "rahul123",
  "disease": "heart",
  "bloodGroup": "B+",
  "address": "Mumbai"
}

### Book Appointment
{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2026-08-25",
  "appointmentTime": "10:00:00",
  "reason": "Heart checkup"
}

### Apply Leave
{
  "leaveStartDate": "2026-08-10",
  "leaveEndDate": "2026-08-20",
  "postponeDays": 7
}

### Add Billing
{
  "patientName": "Rahul Kumar",
  "totalAmount": 5000,
  "paidAmount": 2000,
  "paymentMethod": "CASH"
}

## UI Requirements
- Sidebar navigation
- Responsive design (mobile + desktop)
- Toast notifications for success/error
- Loading spinners for API calls
- Confirmation modal for delete operations
- JWT token in Authorization header for all protected routes
- Auto logout when token expires
- Protected routes based on role (DOCTOR/PATIENT)
- Pagination controls for lists
- Empty state UI when no data
- Form validation before API calls

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4e0c48c9-94ee-4f09-897f-7b67ca1bb304).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
