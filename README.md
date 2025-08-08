# 📁 Demo Dropbox – File Manager Application

A **full-stack file management system** built using **React** (frontend) and **Spring Boot** (backend) that allows users to upload, view, download, and delete files with secure authentication and a responsive UI.

---

## 🚀 Features

- 🔐 User authentication (registration & login)
- ⬆️ File upload with multipart form support
- 👀 In-browser file viewing (for supported formats)
- ⬇️ File download functionality
- ❌ File deletion with confirmation
- 📄 Real-time file listing
- 📱 Responsive UI with error handling

---

## 🧰 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Java JDK](https://www.oracle.com/java/technologies/javase-downloads.html) (v18 or higher)
- [Maven](https://maven.apache.org/) or Gradle (for backend build)

---

## 📁 Project Structure

```
project-root/
├── file-server-frontend/        # React frontend
│   ├── src/
│   │   └── App.js               # Main React component
│   ├── package.json
│   └── ...
└── file-server-backend/         # Spring Boot backend
    ├── src/main/java/
    │   └── com/example/...
    ├── pom.xml
    └── ...
```

---

## ⚙️ Configuration

### 🔖 File Storage Path

Set in `application.properties`:
```
file.storage.path=./uploads
```

### 💾 Database

Using **MongoDB Atlas** for persistent file and user data storage.

---

## 📡 API Endpoints

### 👤 User Management

| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | `/api/users`                | Register a new user  |
| POST   | `/api/users/authenticate`   | Login existing user  |

### 📂 File Management

| Method | Endpoint                                      | Description            |
|--------|-----------------------------------------------|------------------------|
| POST   | `/api/upload`                                 | Upload a file          |
| GET    | `/api/files?userId={userId}`                  | List user files        |
| GET    | `/api/view/{id}?userId={userId}`              | View file in browser   |
| GET    | `/api/download/{id}?userId={userId}`          | Download a file        |
| DELETE | `/api/delete/{id}?userId={userId}`            | Delete a file          |

---

## 🧪 Getting Started

### 1. 🔧 Run the Backend

```bash
cd file-server-backend

# If using Maven:
mvn clean install
mvn spring-boot:run
```

> The backend will start on `http://localhost:8080`

---

### 2. 💻 Run the Frontend

```bash
cd file-server-frontend

npm install
npm start
```

> The frontend will run on `http://localhost:3000`

---

## 🧑‍💻 Usage Guide

### 🆕 Creating a New Account

- Fill in: **Name**, **Email**, and **Password**
- Click **"Create Account"**
- You’ll be logged in automatically upon success

### 🔑 Logging In

- Leave **Name** field empty
- Enter **Email** and **Password**
- Click **"Login"**

### 📂 File Operations

- **Upload**: Choose a file and click **Upload**
- **View**: Opens the file in a new tab (if viewable)
- **Download**: Saves the file to your system
- **Delete**: Click delete and confirm

---

## 📌 Future Improvements

- ✅ Drag-and-drop file uploads
- ✅ Preview thumbnails for images
- ✅ Pagination and sorting
- ✅ Email verification or OTP-based login

---

## 📬 Feedback or Contributions

Feel free to fork the project and submit a pull request. For issues, please open an issue on the [GitHub repository](https://github.com/vanshgoyal/demo-dropbox).
