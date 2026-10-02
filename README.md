# Online Course Platform API

A production-oriented RESTful backend API for an online learning platform built with:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Joi
- Jest
- Supertest
- Swagger / OpenAPI
- Docker

The project was developed as an individual backend project and follows a layered architecture designed to keep business logic, HTTP handling, validation, authentication, security, and data access clearly separated.

---

# 1. Project Overview

The Online Course Platform API provides the backend for an online learning platform where:

- Instructors can create and manage courses.
- Courses contain lessons.
- Students can enroll in courses.
- Students can interact with course content through comments.
- Users can rate courses.
- Students can track lesson progress.
- Users can manage a course wishlist.
- Instructors can access instructor-oriented dashboard functionality.
- Administrators can access administrative dashboard functionality.

The project started from the required academic specification and was then extended with additional functionality, security mechanisms, testing, documentation, and containerization.

---

# 2. Project Requirements Mapping

The academic project specification defines the Online Course Platform around:

### Core Features

- User authentication
- Instructor and Student roles
- Instructor course creation
- Courses containing lessons
- Student course enrollment
- Student comments

### Required Models

- User
- Course
- Lesson
- Enrollment
- Comment

### Suggested Extra Features

- Course ratings
- Lesson progress tracking
- Course search
- Course categories

The implementation goes beyond the minimum specification by adding additional backend functionality and engineering features.

---

# 3. Implemented Feature Set

## 3.1 Core Features

The required core functionality was implemented.

### Authentication

- User registration
- User login
- JWT authentication
- Protected routes

### Roles

The platform supports:

- Student
- Instructor
- Admin

The first two roles cover the core academic requirement, while Admin was added for platform management.

### Courses

- Instructor course creation
- Course retrieval
- Course updating
- Course deletion
- Course ownership checks
- Course publishing states

### Lessons

- Create lessons
- Update lessons
- Delete lessons
- Lesson ordering
- Course/lesson relationships

### Enrollments

- Student enrollment
- Enrollment validation
- Enrollment status handling
- Course access checks

### Comments

- Create comments
- Retrieve comments
- Update comments
- Delete comments
- Ownership checks

---

# 4. Extra Features Required by the Specification

The academic specification suggests the following extra features, all of which were implemented.

## Course Ratings

Students can rate courses through a dedicated rating domain.

The implementation includes:

- Rating creation
- Rating retrieval
- Rating updates
- Rating deletion
- Enrollment-based access rules
- Rating validation

## Lesson Progress Tracking

Students can track their learning progress.

The implementation supports:

- Lesson progress
- Completion state
- Progress validation
- Enrollment checks
- Course progress logic

## Course Search and Filtering

Course retrieval supports filtering and pagination functionality.

This allows the API to handle larger datasets efficiently instead of returning every resource in a single response.

## Course Categories

Courses can belong to categories.

The category system includes:

- Category management
- Course/category relationships
- Category validation
- Category-based course filtering

---

# 5. Additional Features

Beyond the core requirements and the suggested extra features, the project includes additional functionality.

## Wishlist

Users can manage courses they are interested in.

Supported operations include:

- Add course to wishlist
- Remove course from wishlist
- Retrieve wishlist
- Duplicate prevention
- Ownership validation

## Instructor Dashboard

An instructor-specific dashboard provides aggregated information related to the instructor's courses and activity.

## Admin Dashboard

An administrative dashboard provides platform-level information and aggregated statistics.

## Refresh Token System

Authentication was extended beyond a basic JWT implementation.

The system includes:

- Access tokens
- Refresh tokens
- Refresh token expiration
- Refresh token rotation
- Refresh token revocation
- Logout
- Logout from all sessions
- Refresh token replacement tracking

Refresh tokens are stored as hashes rather than plaintext credentials.

## Account State Management

Users have an active/inactive account state, and inactive users cannot access protected functionality.

## Ownership Authorization

Resource access is not based only on the user's role.

The backend also checks whether the authenticated user owns the resource when required.

---

# 6. Security Features

Security was treated as a dedicated part of the architecture rather than being added only at the end.

Implemented security mechanisms include:

- Helmet
- CORS restrictions
- API rate limiting
- Authentication rate limiting
- Request body size limits
- JWT validation
- Role-based authorization
- Resource ownership checks
- Joi input validation
- Mongoose filter sanitization
- Strict query handling
- Centralized error handling
- Sensitive log redaction
- Production-safe error responses
- Graceful shutdown

---

# 7. Backend Architecture

The project follows a layered architecture:

```text
Client
  │
  ▼
Routes
  │
  ▼
Middleware
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Models
  │
  ▼
MongoDB
```

## Routes

Routes define the REST API endpoints and compose the required middleware.

## Middleware

Middleware handles cross-cutting concerns such as:

- Authentication
- Authorization
- Ownership
- Validation
- Rate limiting
- Logging
- Error handling
- 404 handling

## Controllers

Controllers handle HTTP-level responsibilities:

- Reading requests
- Calling services
- Returning responses

Business logic is kept outside the controllers.

## Services

Services contain the core business logic and database interaction.

## Models

Mongoose models define:

- Schema structure
- Relationships
- Validation rules
- Indexes
- Database constraints

---

# 8. Database Models

The project contains the following main models:

```text
User
Category
Course
Lesson
Enrollment
Comment
Rating
LessonProgress
Wishlist
RefreshToken
```

The required academic models are present:

```text
User
Course
Lesson
Enrollment
Comment
```

Additional domain models were introduced to support the extended feature set.

---

# 9. API Domains

The API is organized into the following domains:

```text
/api/v1/auth
/api/v1/users
/api/v1/categories
/api/v1/courses
/api/v1/lessons
/api/v1/enrollments
/api/v1/comments
/api/v1/ratings
/api/v1/progress
/api/v1/wishlist
/api/v1/instructor-dashboard
/api/v1/admin-dashboard
```

---

# 10. Authentication Architecture

Authentication uses a two-token system.

```text
                    Authentication
                          │
             ┌────────────┴────────────┐
             │                         │
        Access Token              Refresh Token
             │                         │
        JWT / Short-lived        Random Opaque Token
             │                         │
        API Authorization         Stored as Hash
                                       │
                                  MongoDB Record
```

The access token contains the required user identity and role information.

Refresh tokens are:

- Randomly generated
- Hashed before database storage
- Expirable
- Revocable
- Rotated during refresh

This provides a stronger session lifecycle than using a long-lived access token alone.

---

# 11. Validation

Input validation is implemented using Joi.

Validation is performed before business logic executes.

The validation system supports:

- Request body validation
- Query parameter validation
- Route parameter validation
- Unknown field rejection
- Unknown field stripping where appropriate
- Type conversion
- Multiple validation errors
- Consistent validation responses

This keeps invalid input away from the service layer.

---

# 12. Error Handling

The project uses centralized error handling.

Handled error categories include:

- Application errors
- Validation errors
- Mongoose validation errors
- Invalid ObjectId values
- Duplicate key errors
- Invalid JSON payloads
- JWT errors
- CORS errors
- Unexpected server errors

Example:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {}
}
```

Production responses do not expose internal stack traces.

---

# 13. Security and Middleware Flow

Middleware order is intentional.

```text
Helmet
   ↓
CORS
   ↓
HTTP Logger
   ↓
Body Size Limits
   ↓
Health / Readiness
   ↓
API Rate Limiter
   ↓
Routes
   ↓
404 Handler
   ↓
Error Handler
```

For protected routes:

```text
Request
   ↓
Authentication
   ↓
Role Authorization
   ↓
Ownership Authorization
   ↓
Validation
   ↓
Controller
   ↓
Service
```

The exact middleware chain depends on the endpoint.

---

# 14. Health Checks

The backend provides two operational endpoints.

## Liveness

```http
GET /health
```

This confirms that the Node.js application is running.

## Readiness

```http
GET /ready
```

This confirms that the application is ready and MongoDB is connected.

Responses:

```text
200 → Ready
503 → Not Ready
```

This separation makes the API more suitable for containerized deployments.

---

# 15. Logging

Logging uses:

- Pino
- pino-http

Development logs are formatted for readability.

Production logging uses structured logs.

Sensitive request values are redacted, including:

- Authorization headers
- Passwords
- Refresh tokens
- Sensitive cookie values

---

# 16. API Documentation

Swagger / OpenAPI documentation is integrated directly into the Express application.

Documentation endpoint:

```text
http://localhost:5000/api-docs
```

The Swagger documentation describes:

- API routes
- Request bodies
- Responses
- Authentication requirements
- Schemas
- API tags
- Bearer authentication

---

# 17. Testing

Testing was implemented using:

- Jest
- Supertest
- MongoDB integration testing

The project contains:

### Unit Tests

Focused on:

- Services
- JWT utilities
- Password utilities
- Time utilities

### Integration Tests

Focused on:

- Authentication
- Users
- Categories
- Courses
- Lessons
- Enrollments
- Comments
- Health endpoints
- Security behavior

The final Phase 13 test run produced:

```text
Test Suites: 18 passed, 18 total
Tests:       201 passed, 201 total
```

---

# 18. Postman API Testing

Before automated testing, the API was manually tested using Postman.

The Postman collection is included in:

```text
postman/Online Course Platform API.postman_collection.json
```

Manual testing was important because it exposed business-logic issues that were not obvious from implementation alone.

Those issues were fixed in their owning layers and then retested.

---

# 19. Docker

Docker support was added using:

- Dockerfile
- Docker Compose
- MongoDB container
- MongoDB health checks
- Persistent MongoDB volume

Architecture:

```text
Docker Compose
│
├── API
│   └── Node.js + Express
│
└── MongoDB
    └── MongoDB 8
```

The API waits for MongoDB to become healthy before starting.

MongoDB data is stored through:

```text
mongodb_data
```

---

# 20. Environment Management

Configuration is centralized through environment variables.

Example:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/online_course_platform

JWT_ACCESS_SECRET=change_this_to_a_long_random_secret_at_least_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10

LOG_LEVEL=info
```

Production configuration validates:

- Required environment variables
- Port configuration
- Rate-limit configuration
- JWT secret strength

Secrets are never committed to the repository.

---

# 21. Production Hardening

The final hardening phase introduced:

- Stronger environment validation
- Production JWT secret validation
- Structured logging
- Sensitive value redaction
- MongoDB connection timeouts
- Connection pool configuration
- Graceful shutdown
- Shutdown timeout
- SIGINT handling
- SIGTERM handling
- Uncaught exception handling
- Unhandled rejection handling
- Liveness checks
- Readiness checks
- Centralized production-safe errors
- Security integration tests

---

# 22. Project Development Journey

The project was developed incrementally instead of implementing everything at once.

The working process was:

```text
Implement
   ↓
Test
   ↓
Discover Bugs
   ↓
Fix in Correct Layer
   ↓
Retest
   ↓
Commit
```

Each major stage was preserved in Git as a separate commit.

---

# 23. Development Phases

## Phase 01 — Project Setup + Architecture

```text
01: initialize backend project
```

Established:

- Node.js project
- Express application
- Folder structure
- Configuration foundation
- Initial architecture

---

## Phase 02 — Database Models

```text
02: add database models
```

Implemented the initial Mongoose data layer.

Models included:

- User
- Category
- Course
- Lesson
- Enrollment
- Comment
- Rating
- LessonProgress
- RefreshToken
- Wishlist

---

## Phase 03 — Validation Infrastructure

```text
03: add validation infrastructure
```

Implemented:

- Joi
- Validation middleware
- Auth validation
- User validation
- Course validation
- Lesson validation
- Rating validation
- Comment validation
- Progress validation
- Common validation rules

---

## Phase 04 — Service Layer

```text
04: implement service layer
```

Implemented business logic for the main domains.

This established a clear separation between:

```text
HTTP Layer
Business Layer
Data Layer
```

---

## Phase 05 — Controllers

```text
05: implement controllers
```

Implemented HTTP controllers for the service domains.

The controllers were intentionally kept thin, with business rules remaining inside services.

---

## Phase 06 — Authentication and Authorization

```text
06: implement authentication and authorization
```

Implemented:

- Password hashing
- JWT access tokens
- Refresh tokens
- Authentication middleware
- Role middleware
- Ownership middleware
- Token expiration
- Refresh token lifecycle

---

## Phase 07 — Routes

```text
07: implement routes
```

Connected the controllers and middleware into the REST API.

The API became fully accessible through the defined route structure.

---

## Phase 08 — Middleware and Security

```text
08: add middleware and security
```

Implemented:

- Helmet
- CORS
- Rate limiting
- Request validation
- Centralized errors
- 404 handling
- Authentication protection

---

## Phase 09 — Postman Testing and Service Fixes

```text
09: test API with Postman and fix service-layer logic
```

Manual testing uncovered several real business-logic problems.

Important issues included:

- Mongoose query sanitization interactions
- ObjectId comparison assumptions
- Duplicate detection
- Enrollment authorization
- Lesson publishing logic
- Progress logic
- Query validation handling

Instead of disabling security features to make the tests pass, the affected service logic was corrected.

This phase demonstrated the importance of testing actual API behavior rather than relying only on implementation assumptions.

---

## Phase 10 — Automated API Testing

```text
10: add automated API tests
```

Implemented:

- Jest
- Supertest
- Unit tests
- Integration tests
- Test database setup
- Authentication tests
- Domain API tests

This created a regression-safety layer for the API.

---

## Phase 11 — Swagger Documentation

```text
11: add Swagger documentation
```

Implemented:

- Swagger/OpenAPI configuration
- Swagger UI
- Route documentation
- Request schemas
- Response schemas
- Bearer authentication documentation

---

## Phase 12 — Docker Support

```text
12: add Docker support
```

Implemented:

- Dockerfile
- Docker Compose
- MongoDB service
- MongoDB healthcheck
- Persistent database volume
- Environment-based configuration
- API/MongoDB networking

### Challenge

Docker was initially unavailable in the development environment.

The environment had to be configured with WSL so Docker Engine could run correctly.

After the environment was fixed, the following were verified:

```text
docker info
docker compose config
docker compose build
docker compose up -d
docker compose ps
/health
/api-docs
```

---

## Phase 13 — Production Hardening

```text
13: harden backend for production
```

This phase focused on preparing the application for real deployment conditions.

Implemented:

- Environment validation
- Production secret validation
- Structured logging
- Sensitive log redaction
- MongoDB connection hardening
- Graceful shutdown
- Shutdown timeout
- Liveness endpoint
- Readiness endpoint
- Rate limiter cleanup
- Production-safe error handling
- Security integration tests

During this phase, test failures were used to improve the test environment itself rather than weakening the production logic.

Final verification:

```text
Test Suites: 18 passed, 18 total
Tests:       201 passed, 201 total
```

---

# 24. Main Engineering Challenges

## Mongoose Sanitization vs Business Logic

Mongoose filter sanitization changed the behavior of some service-level queries.

Instead of disabling sanitization, the business logic was updated to correctly handle the sanitized behavior.

## Identifier Comparison

Several duplicate and ownership checks required careful comparison of MongoDB ObjectIds and application-level values.

The solution was implemented inside the relevant service layer.

## Enrollment Authorization

Features such as:

- comments
- ratings
- progress

depend on whether a user is actually enrolled in the course.

Those checks were implemented explicitly in business logic.

## Progress Logic

Progress tracking required more than simply storing a boolean.

The system needed to account for:

- Valid lessons
- Enrollment
- Published lessons
- Completion state
- Course progress

## Validation of Query Parameters

The query object required special handling because it should not be mutated carelessly.

The validation middleware was updated to replace the validated query representation correctly.

## Docker Environment

The application itself could be containerized, but the local development machine initially lacked the required Docker runtime.

The environment was configured so the containerized system could finally be built and tested.

## Integration Test Environment

The integration tests use an isolated MongoDB environment.

During production-hardening tests, environment initialization order caused issues with:

- MongoDB readiness
- CORS configuration

The tests were corrected so configuration and database setup were initialized before importing the application.

---

# 25. Code Quality

The project uses:

- ESLint
- Prettier
- Meaningful Git commits
- Layered architecture
- Reusable utility functions
- Centralized error handling
- Centralized configuration
- Automated tests

The goal is maintainable code rather than a collection of independent endpoints.

---

# 26. Bonus Features

The academic specification lists the following bonus opportunities:

- Unit or integration testing using Jest
- API documentation using Swagger / OpenAPI
- Docker containerization
- Rate limiting and security middleware
- Advanced MongoDB aggregation queries
- Deploying the project online

The project has implemented the following bonus areas:

### Implemented

- Jest unit/integration testing
- Swagger / OpenAPI
- Docker
- Rate limiting
- Security middleware
- Advanced dashboard aggregation/query logic

### Remaining Bonus Area

- Online deployment

Deployment is treated as a separate final engineering stage after the backend and documentation are stable.

---

# 27. Academic Requirements and Implementation Mapping

| Academic Requirement | Implementation |
|---|---|
| RESTful API using Express | Implemented |
| MongoDB using Mongoose | Implemented |
| At least 4 Mongoose models | 10 main models |
| JWT Authentication | Implemented |
| Input validation | Joi validation layer |
| Pagination / Filtering | Course listing |
| Centralized error handling | Implemented |
| Clean project structure | Layered architecture |
| README | This document |
| `.env.example` | Included |
| Postman Collection | Included |
| Endpoint testing | Automated + manual |
| Meaningful commit history | 13 structured phases |

---

# 28. Academic Honesty and AI Usage

This project was completed individually.

The academic guidelines state that online resources may be used for learning, entire solutions should not be copied, copying other students' code is prohibited, and the student must be able to explain the code during evaluation.

The guideline specifically states:

> "You must be able to explain your code during evaluation."

It also states that:

> "AI tools may assist but must not generate the full solution."

### AI Usage Note

AI assistance was used only as a learning and implementation-support tool for technical topics that had not been previously studied in depth during the course, including:

- API Documentation with Swagger / OpenAPI
- Backend Security concepts
- Docker and Docker Compose
- Integration Testing

The use of AI was focused on:

- Understanding unfamiliar concepts
- Learning how the technologies work
- Applying those concepts to the project
- Debugging and understanding errors
- Reviewing implementation decisions

The project architecture, existing backend implementation, debugging process, testing process, and final integration were developed and reviewed as part of the project workflow.

Most importantly, I am able to explain the implemented architecture, code flow, security decisions, testing strategy, Docker setup, and the technical decisions made throughout the project during evaluation.

---

# 29. Final Project Structure

```text
online-course-platform/
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── integration/
│   ├── unit/
│   └── setup.js
│
├── postman/
│   └── Online Course Platform API.postman_collection.json
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── eslint.config.js
├── jest.config.js
├── package.json
└── README.md
```

---

# 30. Running the Project

## Local Development

Requirements:

- Node.js
- MongoDB

Install dependencies:

```bash
npm install
```

Create:

```text
.env
```

based on:

```text
.env.example
```

Start development server:

```bash
npm run dev
```

Default API:

```text
http://localhost:5000
```

---

# 31. Docker

Build and start:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d
```

View status:

```bash
docker compose ps
```

View API logs:

```bash
docker compose logs api
```

Stop containers:

```bash
docker compose down
```

---

# 32. Useful Endpoints

```text
GET /health
GET /ready
GET /api-docs
```

Swagger UI:

```text
http://localhost:5000/api-docs
```

---

# 33. Available Scripts

```bash
npm run dev
npm start
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run format
```

---

# 34. Git History

The repository follows a structured phase-based commit history:

```text
01: initialize backend project
02: add database models
03: add validation infrastructure
04: implement service layer
05: implement controllers
06: implement authentication and authorization
07: implement routes
08: add middleware and security
09: test API with Postman and fix service-layer logic
10: add automated API tests
11: add Swagger documentation
12: add Docker support
13: harden backend for production
```

This history reflects the actual development process rather than grouping unrelated changes into large commits.

---

# 35. Final Notes

This project was built incrementally from the academic requirements into a larger production-oriented backend.

The development process focused on:

```text
Requirements
     ↓
Architecture
     ↓
Models
     ↓
Validation
     ↓
Services
     ↓
Controllers
     ↓
Authentication
     ↓
Routes
     ↓
Security
     ↓
Manual Testing
     ↓
Automated Testing
     ↓
Documentation
     ↓
Docker
     ↓
Production Hardening
```

The final result is not only an implementation of the Online Course Platform requirements, but also a backend engineering exercise covering architecture, security, testing, documentation, containerization, debugging, and production preparation.

---

## Author

**Hassan Elnagar**

Computer Science & Artificial Intelligence Student

Focus Areas:

- Backend Engineering
- MERN Stack
- Software Architecture
- Data Analysis
- AI / Machine Learning