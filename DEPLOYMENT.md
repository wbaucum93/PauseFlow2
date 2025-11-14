# PauseFlow Deployment Guide

This guide provides instructions for deploying the PauseFlow frontend and backend to production.

**Recommended Stack:**
- **Frontend:** Vercel
- **Backend:** Google Cloud Run
- **Database:** Firestore (via Google Cloud Project)
- **Authentication:** Firebase Authentication

---

## Part 1: Firebase & Google Cloud Setup

1.  **Create a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Create a new project. This will also create a corresponding Google Cloud project.

2.  **Enable Firebase Services:**
    - **Authentication:** In the Firebase Console, go to `Authentication` -> `Sign-in method` and enable the "Email/Password" provider.
    - **Firestore:** Go to `Firestore Database`, create a database, and start in **production mode**.

3.  **Generate a Service Account Key (for Backend):**
    - In the Google Cloud Console, navigate to `IAM & Admin` -> `Service Accounts`.
    - Find the `firebase-adminsdk` service account.
    - Click on it, go to the `Keys` tab, click `Add Key` -> `Create new key`, and select `JSON`.
    - **This JSON file contains the `project_id`, `client_email`, and `private_key` for your `.env` file.** Keep it secure.

4.  **Upload Firestore Security Rules:**
    - Copy the contents of `FIRESTORE_RULES.rules`.
    - In the Firebase Console, go to `Firestore Database` -> `Rules` tab.
    - Paste the rules and click `Publish`.

---

## Part 2: Backend Deployment (Google Cloud Run)

1.  **Configure Environment Variables:**
    - Rename `backend/.env.example` to `backend/.env` and fill it with the values you've collected.
    - The `FIREBASE_PRIVATE_KEY` needs to be formatted as a single line with `\n` characters for newlines.

2.  **Deploy to Cloud Run:**
    - Ensure you have the `gcloud` CLI installed and authenticated (`gcloud auth login`).
    - Configure Docker for `gcr.io` (`gcloud auth configure-docker`).
    - Navigate to the `backend` directory.
    - **Build the Docker Image:**
      ```bash
      gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/pauseflow-backend
      ```
    - **Deploy the Image to Cloud Run:**
      ```bash
      gcloud run deploy pauseflow-backend \
        --image gcr.io/[YOUR_PROJECT_ID]/pauseflow-backend \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --port 8080
      ```
      *Note: `--allow-unauthenticated` is used here for simplicity to allow access to the Stripe webhook. For higher security, you could create a separate, authenticated service and a second unauthenticated one just for the webhook.*

3.  **Set Secrets in Cloud Run:**
    - After the service is deployed, go to the Google Cloud Run console.
    - Select your `pauseflow-backend` service and click `Edit & Deploy New Revision`.
    - Under the `Variables & Secrets` tab, add each variable from your `.env` file as a secret. This is more secure than build-time environment variables.
    - The `FIREBASE_PRIVATE_KEY` can be added as a multi-line secret.

4.  **Get the Service URL:**
    - Once deployed, Cloud Run will provide a public URL for your service (e.g., `https://pauseflow-backend-....run.app`). This is your `APP_BASE_URL` for the frontend.

---

## Part 3: Frontend Deployment (Vercel)

1.  **Create a Vercel Project:**
    - Connect your Git repository (GitHub, GitLab, etc.) to Vercel.
    - Vercel will automatically detect that it's a React project. The default build settings should work.

2.  **Configure Environment Variables:**
    - In your Vercel project dashboard, go to `Settings` -> `Environment Variables`.
    - Add the following variables:
      - `VITE_API_BASE_URL`: The URL of your deployed Google Cloud Run backend service.
      - `VITE_FIREBASE_API_KEY`: Found in your Firebase project settings (`Project settings` -> `General` -> `Web API Key`).
      - `VITE_FIREBASE_AUTH_DOMAIN`: e.g., `your-project.firebaseapp.com`
      - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID.

3.  **Whitelist Your Domain in Firebase Auth:**
    - In the Firebase Console, go to `Authentication` -> `Settings` -> `Authorized domains`.
    - Add your Vercel production domain (e.g., `app.pauseflow.com`) and any preview domains (e.g., `*.vercel.app`).

4.  **Set CORS on the Backend:**
    - Your backend `index.ts` is configured to use the `ALLOWED_ORIGINS` environment variable. Ensure this secret in Cloud Run includes your Vercel domain.

5.  **Deploy:**
    - Push your code to the main branch. Vercel will automatically build and deploy the frontend.
