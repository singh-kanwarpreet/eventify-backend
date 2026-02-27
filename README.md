# Eventify Backend

[![Node.js](https://img.shields.io/badge/Node.js-v18.16.0-green)](https://nodejs.org/)  
[![Express](https://img.shields.io/badge/Express-4.x-orange)](https://expressjs.com/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0-brightgreen)](https://www.mongodb.com/)

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [Setup & Installation](#setup--installation)  
- [Environment Variables](#env)  
- [API Endpoints](#main-api-endpoints)  

---

## Overview

**Eventify** is a full-featured **event management platform** backend built with **Node.js**, **Express**, and **MongoDB**.  
It supports event creation, organizer management, user reviews, secure authentication, image uploads, and automated email notifications.  
This backend powers the Eventify frontend, providing secure and scalable APIs for web and mobile clients.

---

## Features

- **User Authentication:** Register, login, and password reset using **JWT** and **bcrypt** for secure authentication.  
- **Event Management:** Create, read, update, and delete events.  
- **Organizer Management:** CRUD operations for organizers to manage their events.  
- **Reviews & Ratings:** Users can leave reviews and ratings for events.  
- **Image Upload:** Upload event and organizer images via **Cloudinary**.  
- **Role-based Access Control:** Supports **Admin**, **Organizer**, and **User** roles with access restrictions.  
- **Secure API:** JWT authentication, environment variables, and best practices for sensitive data.  
- **Automated Email Notifications:** Cron jobs for event reminders and updates.  
- **Search & Filter:** Search events by date, category, or location.  
- **Scalable & Modular Architecture:** Designed for production-ready deployment.

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Atlas / Local)  
- **Authentication:** JWT, bcrypt  
- **Email Service:** Nodemailer  
- **Image Storage:** Cloudinary  
- **Task Scheduling:** Node-Cron  
- **Environment Management:** dotenv  
- **Version Control:** Git & GitHub  

---

## Architecture

```text
Eventify Backend


backend/
│
├── controllers/    
│   ├── auth.controller.js
│   ├── event.controller.js
│   ├── registration.controller.js
│   ├── organizer.controller.js
│
├── models/         
│   ├── User.js
│   ├── Organizer.js
│   ├── Event.js
│   ├── Registration.js
│   ├── OrganizerReview.js
│
├── routes/          
│   ├── auth.routes.js
│   ├── event.routes.js
│   ├── organizer.routes.js
│
├── middleware/      
│   ├── auth.middleware.js
│   ├── role.middleware.js
│	  ├── eligibility.middleware.js
|   ├── handleValidationErrors.middleware.js
|
├── services/        
│   ├── email.service.js
│   ├── cloudStorage.service.js
│
├── jobs/            
│   ├── eventStatus.job.js
│
├── utils/           
│   ├── ageCalculator.js
|   ├── certificateTemplate.js
|   ├── cloudinary.js
|   ├── generateCertificate.js
|   ├── reminderTemplate.js
│
├── app.js
├── server.js
└── package.json


```

## Env 
```
JWT_SECRET
MONGO_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GMAIL_USER
GMAIL_PASS
```

## Setup & Installation

```bash
git clone https://github.com/singh-kanwarpreet/eventify-backend.git
cd eventify-backend
npm install
node server.js
```
## Main API Endpoints

### Auth
```http
POST   /user/signup           # User signup with name, email, password, phone, dateOfBirth, role, organization info
POST   /user/login            # User login
GET    /user/logout           # Logout
GET    /remember-me           # Get current user info (requires auth)
```

### Events
```http
POST   /organizer/create                   # Create new event (Organizer only)
GET    /                                  # List all events
GET    /:eventId                           # Get event details by ID
POST   /register/:eventId                  # Register user for event (User only)
GET    /registrations/my                   # Get events registered by current user
GET    /:eventId/registrations            # Get list of users registered for a specific event (Organizer only)
```

### Organizer Dashboard
```http
GET    /dashboard                          # Get organizer dashboard stats
GET    /event/:eventId/registrations       # Get registrations for a specific event
POST   /:eventId/registrations/mark-attendance  # Mark attendance in bulk
DELETE /event/:eventId                      # Delete an event
PUT    /event/:eventId/archive             # Archive an event
PUT    /event/:eventId/unarchive           # Unarchive an event
```

### Organizer Review
```http
GET    /organizers                         # List all organizers
GET    /organizer/:organizerId             # Get details and reviews for an organizer
POST   /organizer/:organizerId/reviews     # Create review for an organizer (User only)
```
