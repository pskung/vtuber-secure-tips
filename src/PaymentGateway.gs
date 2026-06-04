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

      // Frontend error returns: Kept in Thai language since the donor faces this UI
      if (!pdpaConsent) return Utils.createValidationError("จำเป็นต้องกดยินยอม: โปรดยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคลเพื่อดำเนินการต่อค่ะ");
      if (!SecurityService.verifyAndConsumeToken(sessionToken, provider)) return Utils.createValidationError("ระบบยืนยันสิทธิ์เซสชันไม่ผ่าน หรือเซสชันหมดอายุแล้ว กรุณารีเฟรชหน้าต่างใหม่อีกครั้งนะคะ");
      if (!Utils.validateNickname(nickname)) return Utils.createValidationError("ชื่อเล่นที่แสดงต้องมีความยาว 2-25 ตัวอักษร และพิมพ์ได้เฉพาะอักษรไทย อังกฤษ ตัวเลข จุด ขีด หรือเว้นวรรคเท่านั้นค่ะ");
      if (message.length > 100) return Utils.createValidationError("ข้อความส่งให้กำลังใจต้องมีความยาวไม่เกิน 100 ตัวอักษรค่ะ");
      if (isNaN(amount) || amount < 1.00 || amount > 700000.00) return Utils.createValidationError("ยอดสนับสนุนที่กำหนดได้ ต้องอยู่ระหว่าง 1.00 ถึง 700,000.00 บาทค่ะ");

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
        message: err.message.indexOf("Circuit Breaker") !== -1 ? err.message : "เกิดความขัดข้องชั่วคราวในการสร้างรหัสการชำระเงิน กรุณาทดลองทำรายการใหม่อีกครั้งในครู่ถัดไปค่ะ"
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
