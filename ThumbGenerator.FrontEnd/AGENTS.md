# ThumbGenerator Frontend - Agent Guide

This document provides context, standards, and patterns for agents working on the ThumbGenerator Frontend.

## 1. Project Overview
**ThumbGenerator** is a web application for creating YouTube thumbnails, featuring AI-powered enhancements.
*   **Frontend:** Angular 20+, Tailwind CSS 4, Konva.js (Canvas).
*   **Backend:** ASP.NET Core Web API.

## 2. Tech Stack & Dependencies
*   **Framework:** Angular 20.1.0 (`@angular/core`)
*   **Styling:** Tailwind CSS 4.1.18 (`tailwindcss`)
    *   Configured via CSS variables in `src/styles.scss` (using `@theme`).
*   **Graphics/Canvas:** Konva 10.2.0 (`konva`)
*   **State Management:** RxJS (Standard Angular Services).
*   **Build:** Angular CLI / Vite.

## 3. Design System
The design system is implemented using Tailwind CSS 4 variables and utility classes.

### Colors
| Name | Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `--color-primary` | `#2563eb` | Main actions, active states. |
| **Primary Light** | `--color-primary-light` | `#3b82f6` | Hover states. |
| **Accent** | `--color-accent` | `#60a5fa` | Highlights, secondary elements. |
| **Background (Dark)** | `--color-background-dark` | `#0a0a0a` | Main background in dark mode. |
| **Surface (Dark)** | `--color-surface-dark` | `#18181b` | Cards, sidebars in dark mode. |

### Typography
*   **Display Font:** `Space Grotesk` (`--font-display`) - Used for headings and creative text.
*   **Body Font:** `Noto Sans` (`--font-body`) - Used for UI text and paragraphs.

### Animations
Custom animations are defined in `src/styles.scss`:
*   `.animate-fade-in-up`: Slides up and fades in.
*   `.animate-slide-in-right`: Slides in from the right.
*   `.animate-pulse-glow`: Glowing pulse effect (for AI/active states).

## 4. Project Structure
The project follows a **Feature Module** architecture.

```text
src/app/
├── core/               # Singleton services, guards, interceptors, models
│   ├── services/       # API interaction (AuthService, ThumbnailService)
│   ├── guards/         # Route protection (AuthGuard)
│   └── models/         # TypeScript interfaces/types
├── modules/            # Feature modules
│   ├── app/            # Main application (protected routes)
│   │   ├── pages/      # Route components (Dashboard, History)
│   │   └── components/ # Feature-specific components (e.g., StepUploads)
│   ├── auth/           # Authentication pages (Login/Register)
│   └── landing/        # Public landing page
└── components/         # Shared/Global components (currently empty)
```

## 5. Development Patterns

### Coding Standards
*   **Control Flow:** Always use the new Angular control flow syntax (`@if`, `@for`, `@else`, `@switch`) instead of legacy structural directives (`*ngIf`, `*ngFor`, etc.).
*   **Standalone Components:** Do not explicitly set `standalone: true` in component metadata, as it is the default in Angular 19+.

### Component Architecture
*   **Feature-Scoped:** Components that belong to a specific page or feature should be located within that module's directory (e.g., `modules/app/pages/dashboard/components`).
*   **Smart vs. Dumb:**
    *   **Smart (Pages):** Handle data fetching, service calls, and state coordination (e.g., `Dashboard`).
    *   **Dumb (Components):** Receive data via `@Input()`, emit events via `@Output()`, and handle pure UI logic (e.g., `DashboardPreview`).
    *   **Shared App Components:** Always use app-level shared components (`modules/app/pages/components`) within app pages (Dashboard, History) for consistency (e.g., Header, Sidebar).

### API Integration
*   Services are located in `core/services`.
*   Use `HttpClient` to communicate with the backend.
*   **Endpoints:**
    *   `POST /api/thumbnail/generate`: Main generation endpoint (Multipart Form Data).
    *   `GET /api/thumbnail/history`: User's generation history.
*   **Models:**
    *   Requests and Responses are typed in `core/services/thumbnail.service.ts` or `core/models`.

### Styling Conventions
*   Use Tailwind utility classes for 90% of styling.
*   Use `scss` files only for:
    *   Complex, specific component layouts (e.g., Konva canvas containers).
    *   Custom animations not covered by utilities.
    *   `@apply` directives if classes become too repetitive (use sparingly).

### Konva / Canvas
*   Thumbnail generation logic (drag-and-drop, positioning) handles interactions with the `Konva` library.
*   Coordinate canvas state within `ThumbnailComposer` or specific preview components.

## 6. Backend Contract (Reference)
The frontend communicates with a .NET Core API.
*   **Auth:** JWT Bearer Token (handled by `AuthInterceptor`).
*   **Generation Request:**
    *   `templateId`: String (ID of the selected template).
    *   `enhanceWithAi`: Boolean.
    *   `videoImage` / `personImage`: Files (Binary).
    *   `title` / `prompt`: Strings.


