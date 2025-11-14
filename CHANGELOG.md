# PauseFlow - Production Build Changelog

This major update transitions PauseFlow from a frontend-only, mocked data prototype to a fully-functional, production-ready full-stack application.

## 🚀 Key Features & Enhancements

1.  **Full Backend Implementation:**
    - Introduced a new `backend/` directory containing a Node.js/Express application, ready for deployment on Google Cloud Run.
    - Integrated **Firebase Admin SDK** for secure authentication and server-side operations.
    - All business logic has been moved from frontend mocks to the backend.

2.  **Live Stripe Integration:**
    - Implemented **Stripe Connect** for secure user onboarding (OAuth).
    - All subscription management (`pause`, `resume`) now uses the live **Stripe API**.
    - Added a robust **Stripe Webhook** handler to keep app data in sync with Stripe events.

3.  **Real Database & Auth:**
    - **Removed `useMockData` hook entirely.** All frontend components now fetch data from the live backend.
    - Integrated **Firestore** as the primary database with a production-ready data schema.
    - Added comprehensive **Firestore Security Rules** to protect user data.
    - The `useAuth` hook has been refactored to prepare for integration with the **Firebase Authentication** client-side SDK.

4.  **New Feature: Customer Pause Portal:**
    - Created a new, white-label ready `CustomerPausePortal` component.
    - This allows end-customers to pause their own subscriptions via a secure link, feeding data directly into the system.

5.  **Functional Settings & APIs:**
    - The **Settings Panel** is now fully functional, allowing users to save and retrieve their custom pause reasons and white-labeling preferences from Firestore.
    - Established a full suite of REST APIs for metrics, subscriptions, settings, and more.

6.  **Foundation for Advanced Features:**
    - Implemented a v1 rules-based **AI Churn Prediction** endpoint.
    - Added stubs and configuration for **SendGrid** to power automated email workflows.

7.  **Production Readiness:**
    - Added a `Dockerfile` for containerized backend deployment.
    - Provided `.env.example` for secure management of environment variables.
    - Created `DEPLOYMENT.md` with detailed instructions for deploying the frontend (Vercel) and backend (Cloud Run).
    - Wrote a comprehensive `QA_PLAN.md` for manual testing of the entire application flow.
