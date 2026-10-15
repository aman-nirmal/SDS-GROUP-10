# Engineering Guidelines & Steering Rules - COEP Venue Booking System

This document outlines team conventions, architecture principles, and version control guidelines for contributors and AI agents working on this repository.

## 1. Project Principles & Architecture
- Prioritize core requirements before introducing secondary complexity.
- Understand the existing architecture and review existing components before adding new code.
- Write clean, modular, and DRY (Don't Repeat Yourself) code. Abstract shared logic into reusable utility functions or hooks.
- Follow ES6+ standards with 2-space indentation.
- Use intention-revealing, descriptive names for all variables, functions, and components (e.g., `isSlotAvailable`, `bookingTimestamp`).
- Avoid emojis anywhere in the repository, including code comments, docstrings, and commit messages.
- Never push empty files to the repository.

## 2. Configuration & Secrets Management
- Never commit secrets, API keys, passwords, database credentials, or private tokens.
- All environment-specific variables must reside in `.env.local` and be accessed via `import.meta.env.VITE_*`.
- Always maintain `.env.example` with placeholder keys whenever a new environment variable is introduced.

## 3. Git Workflow & Version Control
- **Branch Strategy:**
  - Never commit directly to `main`.
  - Use feature branches (`feature/<name>`, `bugfix/<name>`, `chore/<name>`) to build non-conflicting features in parallel.
  - Pull or rebase with the latest `main` regularly before starting work to prevent merge conflicts.
  - Regularly merge approved and tested branches back into `main`.
- **Commit Standards:**
  - Make frequent, small, atomic commits representing a single logical unit of change.
  - Use present tense and Conventional Commit format: `<type>: <description>`
  - Supported types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`.
  - Example: `feat: add venue availability filter by date`
- **Reviews & Repository Hygiene:**
  - Every change requires a Pull Request (PR) and at least one peer review before merging into `main`.
  - Keep the repo clean: never commit build artifacts, dependencies (`node_modules`), OS files (`.DS_Store`), or logs.

## 4. Backend & Database
- Use Supabase (PostgreSQL) for storing data.
- Handle booking conflicts carefully so two users cannot book the same venue at the same time.

## 5. Testing & Collaboration
- Test components locally as you build them.
- Make sure every team member understands the code they write and can explain it.
