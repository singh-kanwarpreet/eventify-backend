# Event Management Backend

A **RESTful backend API** for an Event Management System built with **Node.js, Express, and MongoDB**. This backend handles **user authentication, event management, organizer management, reviews**, and **image uploads** using Cloudinary. Designed for scalability and real-world usage.  

---

## **Features**

- **User Authentication:** Register, Login, Password Reset with JWT & bcrypt.  
- **Event Management:** Create, read, update, delete events.  
- **Organizer Management:** CRUD operations for organizers.  
- **Reviews & Ratings:** Users can leave reviews and ratings for events.  
- **Image Upload:** Event and organizer images uploaded via Cloudinary.  
- **Role-based Access Control:** Admin, organizer, and user roles supported.  
- **Secure API:** JWT authentication and environment variables for sensitive data.  

---

## **Technologies Used**

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose ODM  
- **Authentication:** JWT, bcrypt  
- **File Storage:** Cloudinary  
- **Environment Management:** dotenv  

---

## **Installation & Setup**

1. **Clone the repository**
```bash
git clone https://github.com/<your-username>/event-management-backend.git
cd event-management-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create a `.env` file** in the root folder with the following variables:
```
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

4. **Run the server**
```bash
npm run dev
```
Server will start on `http://localhost:5000`.  

---

## **API Endpoints**

### **Auth**
- `POST /api/auth/register` – Register a new user  
- `POST /api/auth/login` – Login user and get JWT  
- `POST /api/auth/forgot-password` – Send password reset link  

### **Events**
- `GET /api/events` – Get all events  
- `GET /api/events/:id` – Get event by ID  
- `POST /api/events` – Create new event (protected)  
- `PUT /api/events/:id` – Update event (protected)  
- `DELETE /api/events/:id` – Delete event (protected)  

### **Organizers**
- `GET /api/organizers` – Get all organizers  
- `POST /api/organizers` – Add new organizer (protected)  
- `PUT /api/organizers/:id` – Update organizer (protected)  
- `DELETE /api/organizers/:id` – Delete organizer (protected)  

### **Reviews**
- `POST /api/events/:id/review` – Add review to event (protected)  

---

## **Folder Structure**
```
event-management-backend/
│
├── controllers/       # Request handling logic
├── models/            # Mongoose schemas
├── routes/            # Express route files
├── middlewares/       # Auth, error handling, etc.
├── utils/             # Helper functions (e.g., Cloudinary upload)
├── config/            # DB and environment setup
├── server.js          # Entry point
├── package.json
└── .env               # Environment variables
```

---

## **Deployment**
- Can be deployed on **Heroku**, **Render**, or **Railway**.  
- Frontend can fetch API from hosted backend URL.  
