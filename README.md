# 🔐 Secure Digital Document Vault

<p align="center">
  <strong>A Secure, Centralized Platform for Digital Document Management</strong>
  <br/>
  Upload • Organize • Search • Manage • Share • Protect
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Spring%20Boot-2.7.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-11-orange?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Full%20Stack-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/API-REST-green?style=flat-square" />
  <img src="https://img.shields.io/badge/Security-BCrypt%20%7C%20AES-red?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-Relational-blue?style=flat-square" />
</p>

---

## 📌 About The Project

**Secure Digital Document Vault** is a full-stack web application designed to provide a centralized, organized, and secure environment for managing digital documents.

Traditional document management often involves scattered files, unorganized folders, manual sharing, and limited control over document access. This project addresses these challenges by providing an integrated platform where users can upload, categorize, organize, search, preview, share, and manage their important documents.

The application combines a modern React frontend with a Spring Boot backend, using MySQL for structured data persistence and filesystem-based storage for document files.

The system also incorporates document version management, access permissions, controlled sharing, OCR-related text extraction, integrity verification, reminders, notifications, and backup functionality.

## ✨ Key Features

### 🔑 1. User Authentication & Account Management
- User registration and login.
- Separate administrator login functionality.
- Secure password hashing using BCrypt.
- Account activation and status management.
- Failed login attempt tracking.
- Temporary account lockout after repeated unsuccessful attempts.
- User profile management.

### 📁 2. Document Management
- Upload documents using multipart file handling.
- Support multiple document formats.
- Document categorization and classification.
- Rename and update document details.
- Document preview and download.
- Document metadata management.
- SHA-256 checksum generation.
- Duplicate document detection using checksum comparison.
- Document favorites and recent activity.

### 🗂️ 3. Folder Management
- Create and manage custom folders.
- Organize documents into folders.
- Support nested folder structures.
- Move documents between folders.
- Rename and delete folders.
- Maintain organized document hierarchies.

### 🔍 4. Advanced Document Search
- Search documents by filename.
- Search using original filenames.
- Search extracted document text.
- Case-insensitive database search.
- Retrieve relevant documents through search queries.

### 🔄 5. Document Version Management
- Upload new versions of existing documents.
- Maintain document version history.
- Track version numbers and upload information.
- View previous versions.
- Restore earlier document versions.

### 🔗 6. Secure Document Sharing
- Generate unique token-based sharing links.
- Configure link expiration.
- Set maximum download/access counts.
- Track link usage.
- Revoke active sharing links.
- Allow recipients to access shared documents through public share URLs.

### 🛡️ 7. Access Control Management
- Grant document permissions to users.
- Revoke previously granted permissions.
- Support permission levels:
  - VIEW
  - COMMENT
  - EDIT
  - SHARE
  - DOWNLOAD
  - PRINT
  - ADMIN
- Support access expiration.
- Validate ownership and granted permissions through service-level checks.

### 📄 8. OCR & Document Text Extraction
- Extract embedded text from PDF documents using Apache PDFBox.
- Extract text from supported text-based formats.
- Store extracted content for document search.
- Support document text-processing workflows.

### 🔔 9. Notifications & Reminders
- Create document-related reminders.
- Track upcoming reminders.
- Dismiss and manage reminders.
- Generate in-app notifications.
- Mark notifications as read.
- View recent notifications.

### ⭐ 10. Favorites & Activity Tracking
- Mark documents as favorites.
- View favorite documents separately.
- Track document-related activities.
- Display recent activity.
- Retrieve document-specific activity information.

### 🔐 11. Document Integrity & Digital Signatures
- Generate SHA-256 checksums.
- Compare stored and calculated checksums.
- Detect document integrity mismatches.
- Maintain digital signature records.
- Track signature validation statuses.

### 📊 12. Dashboard & Analytics
- Document statistics.
- Storage-related information.
- Recent document activity.
- Vault health information.
- Quick-access actions.
- Important document-related alerts.

### 💾 13. Backup & Recovery
- Export backup data.
- Restore backup packages.
- Monitor backup status.
- Maintain separate storage directories for backup-related operations.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js 18 |
| Routing | React Router DOM |
| API Communication | Axios |
| State Management | React Context API |
| UI Styling | CSS3 |
| Backend | Java 11, Spring Boot 2.7 |
| Backend Security | Spring Security |
| ORM | Spring Data JPA, Hibernate |
| Database | MySQL 8 |
| Testing Database | H2 |
| Password Security | BCrypt |
| Document Processing | Apache PDFBox |
| API Documentation | SpringDoc OpenAPI / Swagger |
| Build Tool | Maven |
| Frontend Build | npm |
| Testing | JUnit, Spring Boot Test, Jest, React Testing Library |

---

## 🏗️ System Architecture

The application follows a layered full-stack architecture.

```text
                 ┌─────────────────────────┐
                 │      REACT FRONTEND     │
                 │                         │
                 │   Pages & Components    │
                 │   Context Management    │
                 │   API Service Layer     │
                 └────────────┬────────────┘
                              │
                       Axios / REST API
                              │
                              ▼
                 ┌─────────────────────────┐
                 │     SPRING BOOT API    │
                 │                         │
                 │      Controllers       │
                 │           │             │
                 │           ▼             │
                 │     Service Layer      │
                 │           │             │
                 │     ┌─────┴─────┐       │
                 │     ▼           ▼       │
                 │ Repositories  File I/O  │
                 └─────┬───────────┬───────┘
                       │           │
                       ▼           ▼
                 ┌──────────┐  ┌──────────┐
                 │  MySQL   │  │  Vault   │
                 │ Database │  │ Storage  │
                 └──────────┘  └──────────┘
```

### Architecture Components

| Layer | Responsibility |
|---|---|
| Presentation Layer | React pages, reusable components and UI interactions |
| API Service Layer | Centralized Axios requests and backend communication |
| Controller Layer | REST API endpoints and request handling |
| Service Layer | Business logic, validation and document operations |
| Repository Layer | Database queries and persistence |
| Model Layer | JPA entities and application data structures |
| Storage Layer | Document files, versions, backups and processing artifacts |

---

## 📂 Project Structure

```text
document-vault-main/
│
├── reactapp/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── folders/
│   │   │   ├── layout/
│   │   │   └── sharing/
│   │   │
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── tests/
│   │   │
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── springapp/
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/examly/springapp/
│   │   │   │
│   │   │   ├── configuration/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── exception/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   │       └── impl/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   ├── pom.xml
│   └── src/test/
│
└── README.md
```

---

## 🗄️ Database Design

The application uses MySQL with Spring Data JPA for database operations.

### Major Entities

| Entity | Purpose |
|---|---|
| User | Stores user account and authentication information |
| Document | Stores document metadata and ownership information |
| Folder | Maintains folder hierarchy |
| DocumentVersion | Stores document version history |
| AccessControl | Maintains document permissions |
| ShareLink | Stores token-based sharing information |
| Favorite | Tracks favorite documents |
| Tag | Maintains document tags |
| DocumentActivity | Tracks document activities |
| Notification | Stores user notifications |
| Reminder | Maintains document reminders |
| DigitalSignature | Stores digital signature records |

### Important Relationships

- A user can own multiple documents.
- A user can have multiple access permissions.
- A folder can contain multiple documents.
- Folders support parent-child relationships.
- A document can have multiple versions.
- A document can have multiple sharing links.
- A document can have multiple activity records.
- A document can have multiple reminders and signature records.

---

## ⚙️ Installation & Setup

Follow the steps below to run the project locally.

### 1. Prerequisites

Make sure the following are installed:

- Java JDK 11
- Apache Maven
- Node.js and npm
- MySQL 8
- Git

Verify the installations:

```bash
java -version
mvn -version
node -v
npm -v
```

### 2. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd document-vault-main
```

### 3. Database Configuration

Start MySQL and create the database:

```sql
CREATE DATABASE Library;
```

Open:

```text
springapp/src/main/resources/application.properties
```

Configure the database connection:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/Library?createDatabaseIfNotExist=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

Set the `DB_USERNAME` and `DB_PASSWORD` environment variables before running the backend.

### 4. Backend Setup

Navigate to the backend directory:

```bash
cd springapp
```

Install dependencies and build:

```bash
mvn clean install
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

### 5. Frontend Setup

Open another terminal and navigate to:

```bash
cd reactapp
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

Frontend runs at:

```text
http://localhost:8081
```

---

## 🔌 API Documentation

The backend exposes RESTful APIs for communication between the frontend and backend.

Swagger UI is available after starting the backend:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI specification:

```text
http://localhost:8080/v3/api-docs
```

### API Modules

| Module | Endpoint Prefix | Operations |
|---|---|---|
| Authentication | `/api/auth` | Login and logout |
| User Management | `/api/users` | Registration and profiles |
| Admin | `/api/admin` | Administrator login |
| Documents | `/api/documents` | Upload, retrieve, update, delete |
| Folders | `/api/folders` | Folder management |
| Favorites | `/api/favorites` | Favorite management |
| Sharing | `/api/shares` | Create and manage sharing links |
| Access Control | `/api/access` | Grant and revoke permissions |
| OCR | `/api/ocr` | Text extraction |
| Reminders | `/api/reminders` | Reminder management |
| Notifications | `/api/notifications` | Notification management |
| Activity | `/api/activity` | Activity tracking |
| Signatures | `/api/signatures` | Signature and integrity information |
| Dashboard | `/api/dashboard` | Statistics and vault health |
| Backup | `/api/backup` | Backup and restoration |

---

## 🔒 Security Implementation

The project incorporates several security-related mechanisms:

- BCrypt password hashing.
- Failed login attempt tracking.
- Temporary account lockout.
- Service-level ownership validation.
- Document permission management.
- Token-based sharing with expiry and access limits.
- AES-based file encryption functionality.
- SHA-256 document integrity verification.
- Spring Security configuration.


---

## 🧪 Testing

### Backend Testing

Run backend tests using Maven:

```bash
cd springapp
mvn test
```

### Frontend Testing

Run frontend tests:

```bash
cd reactapp
npm test
```

Run frontend tests in CI mode:

```bash
CI=true npm test -- --watchAll=false
```

### Production Build

Generate the React production build:

```bash
npm run build
```

---

## 🚀 Future Enhancements

Potential improvements for the platform include:

- Fully validated JWT authentication.
- More comprehensive role-based authorization.
- AES-256-GCM encryption and secure key management.
- Multi-factor authentication.
- Image-based OCR for scanned documents.
- Full-text indexing and improved search.
- Cryptographically verified digital signatures.
- Enhanced security monitoring.
- Automated backup scheduling.
- Docker-based deployment.
- CI/CD integration.
- Performance and accessibility improvements.

---

## 💡 Project Highlights

| Area | Highlights |
|---|---|
| Architecture | Full-stack React + Spring Boot |
| Backend Design | Layered architecture |
| Document Storage | Filesystem-based storage |
| Database | MySQL with JPA |
| Security | BCrypt, access controls, AES-based encryption |
| Document Organization | Categories, folders and tags |
| Document Lifecycle | Trash, archive, expiry and recovery |
| Versioning | Document history and restoration |
| Sharing | Token-based access links |
| Integrity | SHA-256 checksum verification |
| Processing | PDF text extraction |
| User Experience | Dashboard, notifications and reminders |

---

## 👩‍💻 Development

The project follows a modular development approach:

- Frontend components are separated based on functionality.
- API communication is maintained through dedicated service modules.
- Backend business logic is separated from controllers.
- Repository interfaces handle database operations.
- DTOs are used for request and response handling.
- JPA entities represent persistent application data.

---

## 📄 License

This project is currently provided for educational and development purposes. Add an appropriate open-source license before distributing or reusing the project publicly.

---

<p align="center">
  <strong>Secure Digital Document Vault</strong>
  <br/>
  Making Digital Document Management Smarter, Safer and More Organized.
  <br/><br/>
  ⭐ If you find this project interesting, consider giving it a star!
</p>
