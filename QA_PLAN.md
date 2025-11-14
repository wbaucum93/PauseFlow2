# PauseFlow Manual QA Plan

This document outlines the steps to manually test the core functionality of the PauseFlow application after deployment.

**Prerequisites:**
- Frontend and Backend have been deployed.
- A Firebase project is set up with Email/Password auth enabled.
- You have access to a Stripe account in **Test Mode**.

---

### Test Case 1: New User Onboarding & Stripe Connect

1.  **Sign Up:**
    - Navigate to the deployed frontend URL.
    - Click "Get Lifetime Access" or "Login".
    - Create a new account using an email and password.
    - **Expected:** You are redirected to the `/login` page, as you haven't paid yet. (This may vary based on auth flow, the goal is to land on the Billing Page).

2.  **Purchase Lifetime Plan:**
    - On the Billing Page, click "Secure Your Lifetime Access".
    - A Stripe Checkout session should open.
    - Use a Stripe test card (e.g., 4242...4242) to complete the purchase.
    - **Expected:** After successful payment, you are redirected into the application dashboard. Your user record in Firestore should now have `plan: 'lifetime'`, `planType: 'lifetime'`, and `status: 'active'`.

3.  **Connect Stripe Account:**
    - In the app, you should see a prompt to connect your Stripe account.
    - Click the "Connect with Stripe" button.
    - **Expected:** You are redirected to the Stripe Connect Onboarding flow.
    - Complete the Stripe flow using test data.
    - **Expected:** You are redirected back to the PauseFlow dashboard. A new document should appear in Firestore under `users/{uid}/connected_accounts/` containing your `stripeAccountId`.

---

### Test Case 2: Subscription Management

1.  **Create a Test Subscription in Stripe:**
    - Go to your Stripe Test Mode Dashboard.
    - Create a new Customer.
    - Create a new Subscription for that customer. Note the Subscription ID (e.g., `sub_...`).

2.  **Sync/View Subscriptions:**
    - In the PauseFlow dashboard, the newly created subscription should appear in the "Customers" or "History" table after the next scheduled sync. (For testing, you may need to trigger the sync function manually).
    - **Expected:** The subscription is visible with an "active" status.

3.  **Pause a Subscription:**
    - In the "Subscription Controls" widget, enter the Subscription ID.
    - Add a reason, e.g., "On vacation".
    - Click "Pause".
    - **Expected:** A success notification appears. In your Stripe Test Dashboard, the subscription should now have a `pause_collection` object. The subscription's status in Firestore should be updated to `paused`. A `pause` event is logged in the history.

4.  **Resume a Subscription:**
    - In the "Subscription Controls" widget, enter the same Subscription ID.
    - Click "Resume".
    - **Expected:** A success notification appears. In your Stripe Test Dashboard, the subscription's `pause_collection` should be `null`. The status in Firestore should be `active`.

---

### Test Case 3: Customer-Facing Pause Portal

1.  **Generate Pause Link:**
    - (Manual Step for now) Construct a URL: `[FRONTEND_URL]/[YOUR_UID]/pause?sub=[SUBSCRIPTION_ID]`
    - Open this URL in an incognito window.
    - **Expected:** The white-labeled pause portal appears.

2.  **Submit Pause Request:**
    - Select a pause reason from the dropdown.
    - Click "Confirm Pause".
    - **Expected:** A confirmation message appears. The subscription is paused in Stripe and Firestore, identical to the admin-initiated pause.

---

### Test Case 4: Settings

1.  **Navigate to Settings:**
    - In the admin sidebar, click "Settings".
    - **Expected:** The settings page loads, showing default pause reasons.

2.  **Add a Pause Reason:**
    - In the input field, type "New test reason".
    - Click "Add".
    - **Expected:** "New test reason" appears in the list. The `pauseReasons` array in `users/{uid}/settings/config` in Firestore is updated.

3.  **Delete a Pause Reason:**
    - Click the trash icon next to "New test reason".
    - **Expected:** The reason is removed from the UI and the Firestore document.

---

### Test Case 5: Admin User

1.  **Set Admin Flag:**
    - Manually edit a user document in Firestore and set `isAdmin: true`.
    - Log in as that user.
    - **Expected:** The full admin sidebar with "Customers", "Workflows", "Settings", etc., is visible.

2.  **View Customer Data:**
    - Go to the "Customers" panel.
    - **Expected:** You can see a list of all customers linked to your connected Stripe account.
