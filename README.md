# VTuber Secure Tips (PDPA-Compliant Model)

Highly resilient, modular, stateless backend gateway designed on Google Apps Script (GAS) Serverless context. Facilitates and triggers dynamic PromptPay QR code generation and live stream notification alerts anonymized under Thailand's PDPA rules.

---

## 🚀 Key Security Features
1. **PDPA/GDPR Compliance:** Discards real bank names and account strings. Broadcasts only display nicknames.
2. **Aggregated Self-Healing Circuit Breaker:** Dynamically drops broken alert endpoints without affecting payment records [1.1.3].
3. **Anti-Automation Throttling:** Multi-layered Proof-of-Work client check combined with dynamic global spike-rate queue limits.
4. **Strict Nonce CSP:** Zero 'unsafe-inline' elements. Secure dynamic event listeners mapped under active nonce checks.
5. **30-Day Automated Data Purge:** Automated daily time-driven cron cleanses donor history older than 30 days.

---

## 🛠️ Deployment Steps

### 1. Register System Secrets
1. Navigate to your [Google Apps Script Editor](https://script.google.com/).
2. Copy the consolidated files into your workspace.
3. Open `src/Secret.gs` and fill in your private GCP, Firebase, Streamlabs and Xendit credentials.
4. Run the function `initializeSystemSecrets`.
5. **[Mandatory]** Delete `src/Secret.gs` permanently from the project after execution.

### 2. Configure the 30-Day Data Purge Trigger
1. In the Apps Script sidebar, click the **Triggers** icon (Clock).
2. Click **Add Trigger** and set:
   * **Choose function:** `cleanupExpiredDonations`
   * **Event source:** `Time-driven`
   * **Type of time-based trigger:** `Day timer`
   * **Select hour:** Choose low-traffic hours (e.g., `Midnight to 1 AM`)
3. Save the trigger.

### 3. Deploy the Web App
1. Click **Deploy** -> **New Deployment**.
2. Select **Web App**.
3. Set **Execute as:** `Me` (Your account).
4. Set **Who has access:** `Anyone` (Public).
5. Deploy and copy the Web App URL (Configure this URL inside your Xendit Dashboard Webhooks).
