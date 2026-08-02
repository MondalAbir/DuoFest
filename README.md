# 🎉 DuoFest – Multi-College Fest Management Platform

DuoFest is a modern, full-stack web platform that simplifies the complete lifecycle of college fest management. It enables multiple colleges to organize, manage, and promote events while providing students with a seamless registration experience using Email OTP verification and QR-based entry. The platform also includes dedicated portals for Super Admins, College Admins, and Volunteers to efficiently manage events, registrations, attendance, certificates, and analytics.

---

# 📌 Problem Statement

Managing college festivals manually often leads to fragmented registrations, inefficient communication, long entry queues, paper-based attendance, and difficulty in managing volunteers and certificates.

DuoFest solves these challenges by providing a centralized platform where:

- Colleges can host and manage festivals.
- Students can discover and register for events without creating an account.
- Volunteers can perform fast QR-based event check-ins.
- Administrators can monitor registrations, attendance, certificates, and reports in real time.

---

# 🚀 Tech Stack

## Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Router DOM
- TanStack Query
- Axios

## Backend
- Laravel 12
- PHP 8.4
- Laravel Sanctum
- Spatie Laravel Permission
- Firebase Authentication (Email OTP)

## Database
- MySQL

## Additional Services
- Firebase Authentication
- SMTP Email Service
- QR Code Generation
- PDF Ticket & Certificate Generation

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/MondalAbir/DuoFest.git
cd DuoFest
```

---

## Frontend Setup

```bash
npm install
npm run dev
```
---

## Backend Setup

```bash
cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate

php artisan db:seed

php artisan serve
```
---

# ▶️ Running the Project

### Start Frontend

```bash
npm run dev
```

### Start Backend

```bash
php artisan serve
```

---

# 🏗️ Architecture Overview

```
                        ┌────────────────────┐
                        │    Landing Page    │
                        └─────────┬──────────┘
                                  │
                 Explore Events & Register
                                  │
                                  ▼
                     Firebase Email OTP
                                  │
                                  ▼
                      Laravel REST API
                                  │
         ┌──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼
 Super Admin      College Admin     Volunteer
                                  │
                                  ▼
                           QR Verification
                                  │
                                  ▼
                          Attendance System
                                  │
                                  ▼
                     Certificate Generation
                                  │
                                  ▼
                             Email Delivery
```

---

# ✨ Key Features

## 🌐 Public Website

- Premium Landing Page
- Explore College Events
- Event Details
- Student Registration
- Firebase Email OTP Verification
- Instant QR Ticket Generation
- Email Ticket Delivery
- Responsive Design

---

## 👑 Super Admin Portal

- Dashboard Analytics
- College Management
- College Admin Management
- Event Monitoring
- Registration Management
- Volunteer Management
- Reports & Analytics
- Activity Logs
- Announcements
- Platform Settings

---

## 🏫 College Admin Portal

- Create & Manage Events
- My Events
- Event Details
- Student Registrations
- Volunteer Management
- Check-in Monitoring
- Student Directory
- Certificate Management
- Gallery
- Sponsors
- Reports
- Announcements
- Profile & Settings

---

## 🙋 Volunteer Portal

- Mobile-First Design
- QR Code Scanner
- Entry Validation
- Attendance Recording
- Entry History
- Personal Profile

---

## 🎫 Smart Registration System

- No Student Account Required
- Firebase Email OTP Verification
- Secure Registration
- QR Ticket Generation
- Email Confirmation

---

## 🎓 Certificate System

- Automatic Eligibility Detection
- PDF Certificate Generation
- Email Certificates
- Bulk Certificate Management

---

## 📊 Reports & Analytics

- Registration Reports
- Attendance Reports
- Revenue Reports
- Volunteer Reports
- Certificate Reports
- Export (PDF / Excel / CSV)

---

# 📸 Screenshots

### Landing Page

> *<img width="1470" height="741" alt="image" src="https://github.com/user-attachments/assets/9b46252a-892e-44f4-afea-dd33aeb1d5b5" />*


### Super Admin Dashboard

> *<img width="1470" height="741" alt="image" src="https://github.com/user-attachments/assets/115219c4-399c-4c75-bac7-b34fc831d70a" />*

### College Admin Dashboard

> *<img width="1470" height="741" alt="image" src="https://github.com/user-attachments/assets/03398dd5-9cf0-4b28-ba95-d744d0426396" />
*

### Volunteer Portal

> *<img width="1470" height="741" alt="image" src="https://github.com/user-attachments/assets/8da86819-14e3-4079-9747-07613258eb64" />
*

---

# 🎥 Demo

### Live Demo

```
Coming Soon
```

### Demo Video

```
Coming Soon
```

---

# 🔒 Roles

### Super Admin

- Manage Colleges
- Manage College Admins
- Monitor Platform
- Reports
- Analytics

### College Admin

- Create Events
- Manage Registrations
- Manage Volunteers
- Generate Certificates

### Volunteer

- Scan QR Codes
- Verify Entry
- Record Attendance

### Student

- Explore Events
- Register
- Receive QR Ticket
- Attend Events
- Receive Certificate

---

# 📂 Project Structure

```
DuoFest
│
├── frontend
│   ├── src
│   ├── public
│   └── components
│
├── backend
│   ├── app
│   ├── routes
│   ├── database
│   └── resources
│
└── README.md
```

---

# 🚀 Future Scope

- Online Payment Gateway Integration
- AI-based Event Recommendations
- Push Notifications
- Mobile Application
- Digital ID Cards
- Live Event Streaming
- Attendance Analytics
- Sponsor Dashboard
- Multi-language Support
- Cloud Deployment
- Event Feedback & Ratings
- Public API for Colleges

---

# 👨‍💻 Team Members

| Name | Role |
|------|------|
| Abir Mondal | Full Stack Developer |
| Susmita Hazra | Frontend Developer |
---

# ❤️ Built With

**React • Laravel • Firebase • MySQL • Tailwind CSS • TypeScript • Vite**

---

## ⭐ If you like this project, consider giving it a Star on GitHub!
