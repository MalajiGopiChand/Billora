# Subscription and Admin Setup

The browser cannot safely process payments or create free-access accounts. Those operations use the trusted Firebase Functions in `functions/src/index.ts`.

1. Install and deploy Functions:

   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

2. Add Razorpay secrets. Never put the secret key in a Vite environment file.

   ```bash
   firebase functions:secrets:set RAZORPAY_KEY_ID
   firebase functions:secrets:set RAZORPAY_KEY_SECRET
   ```

3. Place only the public key in `.env.local`:

   ```bash
   VITE_RAZORPAY_KEY_ID=rzp_live_...
   VITE_FIREBASE_FUNCTIONS_REGION=asia-south1
   ```

4. Assign an initial administrator custom claim from a trusted Node Admin SDK script or Firebase Cloud Shell:

   ```ts
   await getAuth().setCustomUserClaims('USER_UID', { admin: true });
   ```

   The administrator must sign out and in again for the claim to refresh.

`grantComplimentaryAccess` creates the supplied Firebase account and an active complimentary subscription. It is callable only by a user with the `admin` custom claim.
