# Billora Billing and Invoicing

## Setup

1. Create a Firebase project and enable **Email/Password** in Authentication.
2. Create a Firestore database in production mode.
3. Copy `.env.example` to `.env.local` and fill in the Firebase web-app values from Firebase Project Settings.
4. Deploy the included `firestore.rules` and `firestore.indexes.json` with the Firebase CLI:

   ```bash
   firebase init firestore
   firebase deploy --only firestore
   ```

5. Install and start the app:

   ```bash
   npm install
   npm run dev
   ```

## Data isolation

Every customer, product, and invoice stores a `userId`. The Firestore rules require the signed-in Firebase user's UID to match it; company settings use the UID as the document ID. Keep the supplied rules deployed before using production data.

## Main workflow

- Set company details and default terms in **Settings**.
- Add reusable stock items in **Products**.
- Create an invoice in **Create Bill**. The Enter key moves from Description to Box, Qty, Rate, Discount, then starts the next row.
- Save the invoice after printing or downloading it. Use **All Bills** to preview, edit, delete, or reprint saved invoices.
