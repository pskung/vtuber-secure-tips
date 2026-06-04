// =========================================================================
// 🌉 GLOBAL BRIDGE / DISPATCHER (src/Code.gs)
// =========================================================================

/**
 * Access point to initialize a secure validation session token.
 */
function initializeSession(clientFingerprint, clientTimestamp, clientNonce) {
  return SecurityService.initializeSession(clientFingerprint, clientTimestamp, clientNonce);
}

/**
 * Access point to verify form data and initialize a PromptPay QR transaction.
 */
function createPayment(formData) {
  return PaymentGateway.createPayment(formData);
}

/**
 * Time-driven trigger execution anchor to prune expired database entries.
 */
function cleanupExpiredDonations() {
  return DatabaseService.cleanupExpiredDonations();
}
