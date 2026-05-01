# GM Vocabulary

> Full-stack Angular application demonstrating scalable frontend architecture, modern state management, and secure authentication patterns.

---

## 🚀 Overview

**GM Vocabulary** is a full-stack vocabulary learning platform built with Angular and Node.js.

Beyond core functionality, the project is designed to demonstrate **production-grade engineering practices**:

- Scalable frontend architecture (Angular + Signals)
- Clean and predictable state management without global store complexity
- Secure authentication flows (JWT)
- Clear separation of concerns across the full stack

This project reflects patterns used in **enterprise SaaS applications**.

---

## 🎯 Key Highlights

- Signal-based state management (NgRx SignalStore)
- JWT authentication with auto-login / auto-logout
- Fully protected API with middleware validation
- Interceptor-driven HTTP architecture
- Modular backend (Express.js + Mongoose)
- Clean and scalable UI architecture (Angular + Tailwind + Material)

---

## 🧩 Features

- User authentication (signup / login)
- Vocabulary & collection management
- Protected routes with Angular guards
- Persistent sessions with auto-restore
- Reactive UI powered by Angular Signals
- HTTP interceptor for centralized auth handling

---

## 🏗 Architecture

### Frontend

The application follows a **scalable Angular architecture**:

- Container / Presentational component pattern
- Signal-based state management (NgRx SignalStore)
- Centralized authentication state (Signals)
- Service layer for API abstraction
- HTTP interceptors for cross-cutting concerns

### Key Engineering Decisions

- **SignalStore over NgRx Store**  
  → reduces boilerplate while maintaining predictable state management

- **Interceptor-based architecture**  
  → clean handling of authentication and cross-cutting concerns

- **Separation of concerns**  
  → improves maintainability, testability, and scalability

---

### Backend

The backend follows a **modular Express architecture**:

- Route → Controller → Middleware separation
- Authentication middleware for request validation
- Mongoose-based data modeling
- Scalable API structure for domain-driven expansion

---

## 🔐 Authentication

JWT-based authentication with full client-server flow:

- Secure login/signup with bcrypt hashing
- Stateless authentication using JWT
- HTTP interceptor for automatic token injection
- Route protection via Angular guards
- Auto-login & auto-logout based on token expiration

### Flow Overview

1. User logs in → backend returns JWT  
2. Token is stored in localStorage  
3. Interceptor attaches token to requests  
4. Backend middleware validates JWT  
5. App restores session on reload  

📄 Detailed flow documentation:  
👉 https://www.notion.so/Authentication-flow-353ad045035b80e7a3baf41bb0d21fe7

---

## 🔐 Security

- Password hashing with bcrypt
- Stateless authentication using JWT
- Protected endpoints via middleware
- Authorization via Bearer tokens

### Production considerations

- Move JWT secret to environment variables
- Implement refresh tokens
- Consider HttpOnly cookies (XSS mitigation)

---

## ⚙️ Tech Stack

### Frontend
- Angular v21
- NgRx SignalStore
- Angular Material
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## 🧠 Why This Project Exists

This project was built as a **portfolio application** to demonstrate:

- Senior-level Angular architecture
- Full-stack engineering capabilities
- Modern state management (Signals)
- Secure authentication design

---

## 🗺 Roadmap

- Refresh token implementation
- Role-based access control (RBAC)
- Vocabulary learning modes (quiz / spaced repetition)
- SSR (Angular Universal)
- Docker & CI/CD setup

---

## 🖥 Demo

> Coming soon (deployment in progress)

---

## 🛠 Getting Started

### Development

```bash
ng serve
npm run start:server
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 📚 Additional Notes
This project emphasizes:
- Clean architecture over quick implementation
- Predictable state management
- Production-ready patterns

## 👤 Author
Serhii Diachenko <br/>
Senior Angular Engineer (10+ years) <br/>
Specializing in scalable frontend architecture, RxJS, and data-intensive applications
