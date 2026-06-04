// =========================================================================
// 💳 PAYMENT GATEWAY INTEGRATION MODULE (src/PaymentGateway.gs)
// =========================================================================

const PaymentGateway = {
  createPayment: function(formData, gasProvider) {
    const provider = gasProvider || GAS_;
    try {
      if (!formData) throw new Error("Null parameter payload.");

      const sessionToken = String(formData.sessionToken || "");
      const nickname = String(formData.nickname || "").trim();
      const message = String(formData.message || "").trim();
      const amount = parseFloat(formData.amount);
      const pdpaConsent = Boolean(formData.pdpaConsent);

      if (!pdpaConsent) return Utils.createValidationError("Consent Required: You must agree to the data protection policies.");
      if (!SecurityService.verifyAndConsumeToken(sessionToken, provider)) return Utils.createValidationError("Session token validation failed or expired. Please reload the page.");
      if (!Utils.validateNickname(nickname)) return Utils.createValidationError("Nickname must be alphanumeric, containing only Thai/English, spaces, dots, or hyphens (2-25 characters).");
      if (message.length > 100) return Utils.createValidationError("Message cannot exceed 100 characters.");
      if (isNaN(amount) || amount < 1.00 || amount > 700000.00) return Utils.createValidationError("Amount must be between 1.00 and 700,000.00 THB.");

      const config = Config.get(provider);
      const xenditSecret = config.XENDIT_SECRET_KEY;
      if (!xenditSecret) throw new Error("Missing Xendit payment integration credentials.");

      const referenceId = "donation-" + Utilities.getUuid();
      const authHeader = "Basic " + Utilities.base64Encode(xenditSecret + ":");
      const xenditUrl = "https://api.xendit.co/qr_codes";
      
      const xenditPayload = {
        reference_id: referenceId,
        type: "DYNAMIC",
        currency: "THB",
        amount: amount,
        channel_code: "PROMPTPAY",
        metadata: { nickname: nickname, message: message }
      };

      const xenditResponse = provider.fetch(xenditUrl, {
        method: "post",
        headers: {
          "Authorization": authHeader,
          "api-version": "2022-07-31",
          "Content-Type": "application/json"
        },
        payload: JSON.stringify(xenditPayload),
        muteHttpExceptions: true
      });

      const resText = xenditResponse.getContentText();
      if (xenditResponse.getResponseCode() !== 200 && xenditResponse.getResponseCode() !== 201) {
        Utils.safeLog("[XENDIT_API_ERROR] Gateway creation request rejected by downstream payment API.", "ERROR", resText, provider);
        throw new Error("Payment gateway rejected QR payload creation request.");
      }

      const xenditData = JSON.parse(resText);
      return {
        success: true,
        reference_id: referenceId,
        qr_string: xenditData.qr_string,
        amount: amount
      };
    } catch (err) {
      Utils.safeLog("[CRITICAL_CREATE_PAYMENT_EXCEPTION] Transaction generation pipeline failed.", "ERROR", err, provider);
      return {
        success: false,
        isValidationError: false,
        message: err.message.indexOf("Circuit Breaker") !== -1 ? err.message : "A temporary transaction generation failure occurred. Please try again later."
      };
    }
  },

  verifyPaymentDirectlyWithXendit: function(qrCodeId, gasProvider) {
    const provider = gasProvider || GAS_;
    const config = Config.get(provider);
    const xenditSecret = config.XENDIT_SECRET_KEY;
    if (!xenditSecret || !qrCodeId) return false;

    const cleanQrCodeId = String(qrCodeId).trim();
    if (!/^[a-zA-Z0-9_\-]+$/.test(cleanQrCodeId) || cleanQrCodeId.length > 64) {
      Utils.safeLog("[SECURITY_ALERT] SQLi/SSRF containment block triggered on transaction validation.", "WARNING", cleanQrCodeId, provider);
      return false;
    }

    const authHeader = "Basic " + Utilities.base64Encode(xenditSecret + ":");
    const url = "https://api.xendit.co/qr_codes/" + encodeURIComponent(cleanQrCodeId) + "/payments";
    
    try {
      const response = provider.fetch(url, {
        method: "get",
        headers: { "Authorization": authHeader, "api-version": "2022-07-31" },
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() === 200) {
        const payments = JSON.parse(response.getContentText());
        if (payments && payments.data && payments.data.length > 0) {
          return payments.data.some(function(pay) {
            return pay.status === "SUCCEEDED" || pay.status === "COMPLETED";
          });
        }
      } else {
        Utils.safeLog("[XENDIT_VERIFY_WARN] Downstream payment verification query rejected.", "WARNING", response.getContentText(), provider);
      }
    } catch (err) {
      Utils.safeLog("[XENDIT_VERIFY_ERROR] Exception occurred during double-verification flow.", "ERROR", err.toString(), provider);
    }
    return false;
  }
};
