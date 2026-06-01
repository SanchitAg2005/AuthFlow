# AuthFlow (Advanced Role-Based Access System)

AuthFlow is a production-grade, highly scalable REST API featuring secure JWT Authentication, strict Role-Based Access Control (RBAC), robust request validation, dynamic Swagger documentation, and containerization.

This project was built as an advanced Backend Engineering Intern assignment, demonstrating enterprise architecture and engineering practices while maintaining minimal complexity for rapid development.

---

## 🛠️ Technology Stack & Architecture

### Backend Core
* **Runtime**: Node.js (v18+)
* **HTTP Engine**: Express.js
* **Data Access**: MongoDB with Mongoose ODM (normalized schema modeling, compound indexing)
* **Session Security**: JWT Authentication via HTTP headers (`Authorization: Bearer <token>`)
* **Cryptography**: Password hashing via BcryptJS with standard Cost Factor 10
* **Request Validation**: Strictly typed schemas using **Zod**
* **Documentation**: Dynamic **OpenAPI 3.0** served via **Swagger-JSDoc** & **Swagger-UI**
* **Containerization**: Multi-stage **Docker** & **Docker Compose** orchestration

### Architecture Patterns
This service rejects "fat controllers" and instead implements a highly modular **Controller-Service-Model-Route** pattern to isolate duties cleanly:
* **Models**: Define data structure, validation, indexing, and pre-save cryptography hooks.
* **Services**: Encapsulate the core transactional business logic, database queries, and role constraints.
* **Controllers**: Bind Express request routing, invoke Zod schema validation, extract claims, and return uniform JSON envelopes.
* **Middlewares**: Enforce cross-cutting concerns (centralized error logging, authentication guards, and role authorizations).

---

## 📁 Project Structure

```text
authflow/
├── docker-compose.yml           # Multi-container local orchestration
├── README.md                    # System documentation
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # Database connection configuration
│   │   │   └── db.js
│   │   ├── controllers/         # HTTP request/response routers
│   │   │   ├── auth.controller.js
│   │   │   └── task.controller.js
│   │   ├── errors/              # Custom app operational exception classes
│   │   │   └── AppError.js
│   │   ├── middleware/          # Security filters & error interceptors
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── rbac.middleware.js
│   │   │   └── validate.js
│   │   ├── models/              # Mongoose data schemas
│   │   │   ├── task.model.js
│   │   │   └── user.model.js
│   │   ├── routes/              # Route entrypoints
│   │   │   ├── auth.routes.js
│   │   │   ├── index.js
│   │   │   └── task.routes.js
│   │   ├── services/            # Core transactional business services
│   │   │   ├── auth.service.js
│   │   │   └── task.service.js
│   │   ├── utils/               # catchAsync wrappers, Zod schemas, tokens
│   │   │   ├── catchAsync.js
│   │   │   ├── schemas.js
│   │   │   └── token.js
│   │   ├── app.js               # Express application pipeline
│   │   └── server.js            # Server entrypoint running HTTP engine
│   │
│   ├── .env.example
│   ├── Dockerfile           # Multi-stage production container manifest
│   └── package.json
```

---

## 🚀 Getting Started

### Local Development Setup

#### 1. Setup Environment
Navigate into the `/server` folder and duplicate the environment template:
```bash
cd server
cp .env.example .env
```
Ensure your local MongoDB instance is running, or replace `MONGO_URI` with your MongoDB Atlas string:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/authflow
JWT_SECRET=super_secret_authflow_developer_key_9876
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

#### 2. Install & Start Server
```bash
npm install
npm run dev
```
The server will boot on port `5000` with hot-reloading active.

---

### Docker Compose Container Setup

To boot the entire stack (Express server + isolated MongoDB database instances with data volumes persistent on your disk) automatically, run:
```bash
docker-compose up --build
```
This runs the production multi-stage build, exposing:
* **REST API**: `http://localhost:5000/api/v1`
* **Swagger API UI**: `http://localhost:5000/api-docs`

---

## 📖 API Documentation (OpenAPI 3.0)

AuthFlow features integrated **Swagger Documentation** scraped dynamically from route decorators. With the server running, visit:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Summary of Major Endpoints

| Endpoint | Method | Security | Description |
| :--- | :---: | :---: | :--- |
| `/api/v1/auth/register` | `POST` | None | Register account. Returns JWT. |
| `/api/v1/auth/login` | `POST` | None | Login. Returns JWT. |
| `/api/v1/auth/me` | `GET` | Bearer Token | Retrieve active session details. |
| `/api/v1/tasks` | `POST` | Bearer Token | Create a task. Auto-assigns logged-in owner. |
| `/api/v1/tasks` | `GET` | Bearer Token | **Users**: View own tasks. <br>**Admins**: View all tasks. |
| `/api/v1/tasks/:id` | `GET` | Bearer Token | Retrieve single task (RBAC owner check). |
| `/api/v1/tasks/:id` | `PUT` | Bearer Token | Modify task fields (RBAC owner check). |
| `/api/v1/tasks/:id` | `DELETE` | Bearer Token | Delete task (RBAC owner check). |

---

## 📈 Scalability & Design Notes

### 1. Unified Response Signatures
The API implements the clean, industry-standard **JSend** payload specifications:
* **Success Envelope**: `{"status": "success", "data": { ... }}`
* **Fail Envelope**: `{"status": "fail", "code": "VALIDATION_ERROR", "message": "...", "errors": [...]}`

### 2. Strict Zod Request Shielding
Requests undergo rigorous schema parsing at the route interface. Validation blocks unmapped fields, sanitizes string inputs, and throws structured `400 Bad Request` exceptions before execution enters our core service logic.

### 3. Mongoose Compound Indexing
The `Task` collection has a compound index defined on `{ owner: 1, createdAt: -1 }`. As the system grows to millions of task records, querying a user's task history remains an `O(log N)` index-seek instead of an expensive full-table collection scan.

### 4. Microservices Migration Readiness
Because the backend is split cleanly into dedicated **Auth** and **Task** routing/service packages, it can be decoupled into microservices in a weekend:
* The Auth package can be containerized into an isolated `Auth Microservice`.
* The Task package will act as a stateless `Task Microservice`. The API Gateway will decode the JWT and inject standard claims headers (`X-User-Id`, `X-User-Role`) into requests proxying downstream.

### 5. Paginated Task Boards & Regex Querying
The `GET /tasks` endpoint features optimized query parameters:
* **Pagination (`?page=1&limit=10`)**: Prevents large data transfers by implementing `O(log N)` Mongoose cursor skips and limits on query sets.
* **Status Filtering (`?status=TODO`)**: Allows narrowing queries directly at the database layer.
* **Regex Search (`?search=keyword`)**: Implements case-insensitive keyword search on task titles using optimized MongoDB indexes.

### 6. Security Hardening (Helmet & Rate Limiting)
* **Helmet Security Headers**: Dynamically configures secure HTTP response headers to defend against Cross-Site Scripting (XSS), clickjacking, and MIME sniffing attacks.
* **Auth Rate Limiting**: Protects registration and login endpoints by restricting each IP address to a maximum of 20 requests per 15 minutes, preventing automated dictionary and brute-force password attacks.
* **Privilege Escalation Protection**: Admin self-registration is disabled. Public registrations are always assigned the User role. Administrator accounts must be created through controlled administrative processes.
* **Administrative Account Seeding**: To securely spawn a default system administrator, execute the seed command inside the `/server` directory:
  ```bash
  npm run seed
  ```
  This creates a default administrative session (`admin@example.com` / `AdminPassword123!`) if it does not already exist.

### 7. Performance Logging & System Health Diagnostics
* **Native Request Profiler**: Incorporates a zero-dependency request logging middleware utilizing native Node `finish` listeners to measure request-to-response duration in milliseconds without blocking the event loop.
* **Dynamic Health Endpoint (`/api/v1/health`)**: Tracks live server uptime and parses Mongoose readystate indexes (connected, connecting, disconnected, disconnecting) to verify system state instantly.
