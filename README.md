# ParkGuard — Smart Parking Violation Management System

**Smarter Parking. Accountable Enforcement. Safer Campuses.**

ParkGuard is a smart parking violation management platform designed to simplify parking enforcement, manage vehicle violations, track outstanding fines, identify repeat offenders, and support administrative enforcement decisions through a unified digital system.

The platform provides role-based portals for vehicle owners, parking officers, supervisors, and administrators, bringing violation reporting, vehicle records, fine history, and enforcement workflows into one application.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Core Workflows](#core-workflows)
- [Security and Data Integrity](#security-and-data-integrity)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Traditional parking enforcement can involve manual records, fragmented fine tracking, duplicate reports, and difficulty identifying vehicles with repeated violations.

ParkGuard aims to address these challenges through a centralized, role-based application that enables authorized users to record, review, and manage parking violations.

The system is designed around three core objectives:

1. **Digital enforcement:** Record parking violations with structured vehicle information, evidence, timestamps, and location details.
2. **Transparent fine management:** Maintain vehicle-level violation and payment histories.
3. **Intelligent escalation:** Identify repeat offenders and support administrative review of unresolved violations and towing requests.

ParkGuard is designed for campus parking environments and can be adapted to other managed parking facilities.

## Key Features

### 1. Role-Based Access Control

Separate interfaces and permissions for:

- Vehicle Owners
- Parking Officers
- Supervisors
- Administrators

Each role receives access to the functions permitted by its responsibilities.

### 2. Digital Violation Recording

- Record vehicle registration details.
- Select the relevant violation type.
- Capture violation location and timestamp.
- Attach supporting evidence where supported.
- Maintain structured violation records.
- Validate submitted information.

### 3. GPS and Location Support

The application is designed to support location-aware violation reporting, including:

- Browser-based GPS location detection.
- Latitude and longitude capture.
- Location accuracy and capture timestamp.
- Human-readable address resolution through Google Maps services, when configured.
- Map links for reviewing the reported location.

GPS permission, device capabilities, network connectivity, and API configuration may affect availability.

### 4. Vehicle Management

- Search for vehicles using registration numbers.
- View associated violation records.
- Review vehicle details.
- Support vehicle-detail correction workflows with appropriate authorization and audit history.

Registration-number normalization helps identify the same vehicle despite differences in spacing or letter casing.

### 5. Single-Vehicle Fine History

View a vehicle's associated fine history in one place, including supported information such as:

- Violation dates and descriptions.
- Incident evidence and locations.
- Fine amounts and outstanding balances.
- Payment status and transaction references.
- Appeal or dispute information, where implemented.

### 6. Repeat-Offender Detection

ParkGuard is designed to identify vehicles with multiple qualifying violations.

- Group records by normalized vehicle registration number.
- Count distinct incidents rather than duplicate reports of the same incident.
- Identify qualifying repeat offenders using the configured threshold.
- Display relevant violation history and outstanding balances.
- Re-evaluate eligibility when applicable records change.

The actual threshold and eligibility rules are determined by the application's configuration and business logic.

### 7. Administrative Towing Requests

The repeat-offender workflow supports administrative escalation for qualifying vehicles.

The intended workflow includes:

1. Identify a vehicle meeting the configured escalation threshold.
2. Review its qualifying violations and supporting evidence.
3. Create or inspect a towing request, where implemented.
4. Allow authorized administrators to review the request.
5. Record decisions and relevant audit history.

A towing request does not, by itself, mean that physical towing has been authorized or completed.

### 8. Vehicle Correction and Auditability

Vehicle-detail correction workflows are intended to preserve record integrity by tracking changes and restricting sensitive modifications to authorized users.

Corrections should not silently erase historical violations, payment records, or evidence.

### 9. Payment Management

The application is designed to support fine-payment tracking and owner-facing payment workflows.

Only an authorized vehicle owner should be permitted to initiate payment for their own eligible fines. Payment verification must be handled securely on the backend.

Razorpay payments require valid configuration and server-side order and payment verification before being considered complete.

---

## User Roles

| Role | Primary responsibilities |
|---|---|
| Vehicle Owner | View authorized vehicle records, review fines, and pay eligible fines |
| Parking Officer | Record violations, capture evidence, and review authorized records |
| Supervisor | Monitor violations, review repeat offenders, and oversee enforcement activity |
| Administrator | Manage authorized records, review corrections, and adjudicate towing or escalation requests |

Actual access is determined by the application's implemented frontend and backend permissions.

## Technology Stack

The project uses the following technologies based on its existing development setup.

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application development |
| Vite | Frontend development and build tooling |
| Node.js | Server runtime |
| `tsx` | Running the TypeScript server |
| npm | Dependency and package management |
| Google Maps services | Optional location and reverse-geocoding integration |
| Razorpay | Intended payment-gateway integration, subject to configuration |

Additional libraries and storage technologies depend on the current project dependencies and implementation.

## Application Architecture

ParkGuard uses a frontend-and-server architecture.

```text
Vehicle Owner / Officer / Supervisor / Admin
                    |
                    v
             React + TypeScript
                    |
                    v
              Vite Frontend
                    |
                    v
          Node.js / TypeScript Server
                    |
          +---------+----------+
          |                    |
          v                    v
    Application APIs     External Services
                         (when configured)
```

The frontend presents role-specific interfaces, while the server handles supported API operations and server-side integrations.

Sensitive operations such as payment verification and privileged administrative actions should be enforced on the server rather than relying solely on frontend controls.

---

## Getting Started

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/) — use a version compatible with the project's dependencies.
- npm — included with Node.js.
- [Git](https://git-scm.com/) — for source-code management.
- [Visual Studio Code](https://code.visualstudio.com/) or another compatible editor.

### 1. Clone the repository

```bash
git clone https://github.com/harshith1720/ParkGuard.git
```

Navigate into the project directory:

```bash
cd ParkGuard
```

If your local folder has a different name, navigate into that folder instead.

### 2. Install dependencies

```bash
npm install
```

This installs the dependencies defined in the project's package files.

### 3. Configure environment variables

Inspect the existing `.env` files, `server.ts`, and integration code to identify the variables required by your version of the application.

Create a local environment file only if required by the project. See [Environment Configuration](#environment-configuration).

### 4. Start the application

```bash
npm run dev
```

The development server should start if the required dependencies, configuration, and ports are available.

### 5. Open ParkGuard

Visit:

**http://localhost:3000**

The current development setup uses port `3000`. If your terminal reports a different port, use the address printed by the server.

---

## Environment Configuration

Integrations requiring credentials must be configured before they can be used.

Example variable names are shown below for reference. **Only configure variables that the existing application actually reads.** Check `server.ts` and the relevant integration code before adding them.

```dotenv
# Google Maps / Geocoding
GOOGLE_MAPS_API_KEY=your_server_side_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Important security practices:

- Never commit real API keys, passwords, or payment secrets.
- Keep private credentials on the server.
- Restrict Google Maps API keys to the required APIs and usage.
- Use Razorpay test credentials during development.
- Verify payment signatures and payment status on the backend.
- Never trust a frontend success message as proof of payment.
- Do not publish your local `.env` file.

If an environment variable is not used by the existing code, adding it to `.env` alone will not enable that feature.

---

## Running the Application

### Development

```bash
npm run dev
```

This starts the development command configured in `package.json`.

### Linting

```bash
npm run lint
```

Checks the code using the project's configured linting rules, if available.

### Production build

```bash
npm run build
```

Creates the production build using the project's configured build process.

Run the commands separately if you need to identify which check failed.

### Port conflicts

If the server reports `EADDRINUSE`, another process may already be using port `3000` or the Vite WebSocket port `24678`.

On macOS, identify the process using port `3000`:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Inspect the process before stopping it. If an existing ParkGuard instance is already running, you may be able to use it instead of starting another server.

---

## Core Workflows

### Recording a violation

1. Sign in with an authorized Officer account.
2. Open the violation-recording page.
3. Enter or select the vehicle details.
4. Capture the violation location where GPS is available.
5. Record the violation type and supporting evidence.
6. Submit the report.
7. Verify that the saved record appears in the appropriate views.

### Reviewing a vehicle's fine history

1. Open the appropriate vehicle search or fine-history screen.
2. Search by registration number.
3. Review the vehicle's associated incidents.
4. Inspect fine amounts, payment statuses, and available evidence.
5. Confirm that records belong to the correct vehicle.

### Identifying repeat offenders

1. Record distinct qualifying violations for the same vehicle.
2. Open the Repeat Offenders Watchlist.
3. Review the incident count and outstanding balance.
4. Confirm that duplicate reports of the same incident are not counted twice.
5. Inspect any escalation or towing request generated by the configured rules.

### Reviewing towing requests

1. Sign in as an authorized administrator.
2. Open the towing-request or escalation queue.
3. Review the vehicle details and qualifying incidents.
4. Inspect supporting evidence and the request status.
5. Record the appropriate authorized decision.

These workflows should be tested against the actual application before being demonstrated as fully operational.

---

## Security and Data Integrity

ParkGuard handles vehicle information, violation evidence, fines, and potentially payment-related data. The following safeguards are important:

- Enforce role permissions on the backend.
- Restrict owners to records they are authorized to access.
- Prevent officers from performing privileged administrative actions.
- Validate input on the server.
- Protect payment credentials and verify transactions securely.
- Preserve audit trails for sensitive corrections and administrative decisions.
- Prevent duplicate reports from inflating incident counts.
- Preserve historical records when vehicle details are corrected.
- Avoid treating an escalation request as proof that enforcement has been completed.

---

## Future Enhancements

Potential future improvements include:

- Automated vehicle registration recognition from evidence images.
- Enhanced duplicate-incident detection.
- More comprehensive payment reconciliation.
- Configurable escalation policies.
- Advanced vehicle and violation analytics.
- Automated notifications for owners.
- Dedicated towing-service integration.
- Exportable enforcement reports.
- Expanded automated testing and deployment pipelines.

These are proposed enhancements and should not be interpreted as already implemented features.

---

## Troubleshooting

### Application fails to start

Run:

```bash
npm install
npm run dev
```

If an error persists, inspect the terminal output and verify the project's environment configuration.

### Port 3000 is already in use

Run:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Check which process owns the port before taking action.

### GPS is unavailable

Check browser location permission, device location services, and the availability of a secure browser context. Localhost is generally treated as a secure context by modern browsers.

### Address is not populated

Verify that the reverse-geocoding backend route is available and that the required Google Maps API is enabled and configured.

### Payment does not complete

Check the payment provider configuration, server logs, order creation, and backend payment verification. Do not manually mark a transaction as paid to bypass a verification failure.

### Repeat offenders do not appear

Verify the configured threshold, vehicle registration normalization, violation statuses, distinct incident grouping, and whether the watchlist is receiving the latest saved records.

---

## Contributing

Contributions that improve usability, accessibility, reliability, security, and maintainability are welcome.

When making changes:

1. Inspect the existing architecture.
2. Preserve existing functionality and role permissions.
3. Avoid committing secrets or personal data.
4. Run the available lint, build, and test commands.
5. Document new environment variables and setup requirements.

---

## License

No license has been specified in this repository documentation yet. Add an appropriate `LICENSE` file before distributing the project under an open-source license.

---

**ParkGuard — Making Parking Enforcement More Transparent, Structured, and Accountable.**
