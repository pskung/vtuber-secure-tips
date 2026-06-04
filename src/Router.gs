// =========================================================================
// 🛣️ ROUTING & CONTROLLER MODULE (src/Router.gs)
// =========================================================================

function doGet(e) {
  try {
    const config = Config.get();
    const template = HtmlService.createTemplateFromFile('src/Index');
    
    template.powDifficulty = config.POW_DIFFICULTY || 3;
    template.dpoEmail = config.DPO_EMAIL || "dpo@yourstreamdomain.com";
    template.Utils = Utils; 
    
    const output = template.evaluate();
    output.setTitle("VTuber Tips Gateway (PDPA Compliant)");
    output.addMetaTag("viewport", "width=device-width, initial-scale=1");
    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
    return output;
  } catch (err) {
    try {
      const config = Config.get();
      const template = HtmlService.createTemplateFromFile('Index');
      
      template.powDifficulty = config.POW_DIFFICULTY || 3;
      template.dpoEmail = config.DPO_EMAIL || "dpo@yourstreamdomain.com";
      template.Utils = Utils;
      
      const output = template.evaluate();
      output.setTitle("VTuber Tips Gateway (PDPA Compliant)");
      output.addMetaTag("viewport", "width=device-width, initial-scale=1");
      output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
      return output;
    } catch (innerErr) {
      Utils.safeLog("GET Request Rendering Failed", "CRITICAL", innerErr);
      return HtmlService.createHtmlOutput("<h2>A temporary error occurred. Please try again later.</h2>");
    }
  }
}

function include(filename, templateData) {
  try {
    const template = HtmlService.createTemplateFromFile(filename);
    template.Utils = Utils;
    if (templateData && typeof templateData === 'object') {
      for (let key in templateData) {
        template[key] = templateData[key];
      }
    }
    return template.evaluate().getContent();
  } catch (err) {
    const shortName = filename.replace(/^src\//, "");
    const template = HtmlService.createTemplateFromFile(shortName);
    template.Utils = Utils;
    if (templateData && typeof templateData === 'object') {
      for (let key in templateData) {
        template[key] = templateData[key];
      }
    }
    return template.evaluate().getContent();
  }
}

function doPost(e) {
  try {
    const config = Config.get();
    const verifiedToken = config.WEBHOOK_VERIFICATION_TOKEN;
    
    const rawPostData = e.postData.contents;
    if (!rawPostData || rawPostData.length > 50 * 1024) { 
      return Router.createJsonResponse({ error: "Payload exceeds size limit." }, 400);
    }

    const headers = e.headers || {};
    const incomingToken = String(headers["x-callback-token"] || "").trim();

    if (!incomingToken || incomingToken.length > 256 || !/^[a-zA-Z0-9.\-_=]+$/.test(incomingToken)) {
      return Router.createJsonResponse({ error: "Unauthorized access: Malformed token." }, 400);
    }

    if (!verifiedToken || verifiedToken.length < 32) {
      Utils.safeLog("[CRITICAL_SECURITY_ALERT] Webhook verification token is not secure or unset", "CRITICAL", "Unset token block");
      return Router.createJsonResponse({ error: "Internal security configuration error." }, 500);
    }

    if (!SecurityService.safeCompare(incomingToken, verifiedToken)) {
      return Router.createJsonResponse({ error: "Unauthorized access." }, 401);
    }

    let payload;
    try {
      payload = JSON.parse(rawPostData);
    } catch (parseErr) {
      Utils.safeLog("[SECURITY_ALERT] Webhook received invalid JSON payload", "WARNING", parseErr);
      return Router.createJsonResponse({ error: "Invalid JSON format." }, 400);
    }

    let referenceId = "";
    let qrCodeId = "";
    let status = "";
    let nickname = "Anonymous";
    let message = "";
    let amount = 0;

    if (payload && typeof payload === 'object') {
      let qrCodeObj = null;
      if (payload.qr_code && typeof payload.qr_code === 'object') {
        qrCodeObj = payload.qr_code;
        status = "SUCCEEDED"; 
      } else if (payload.data && typeof payload.data === 'object' && payload.data.qr_code) {
        qrCodeObj = payload.data.qr_code;
        status = String(payload.data.status || "");
      } else if (payload.data && typeof payload.data === 'object') {
        qrCodeObj = payload.data;
        status = String(payload.data.status || "");
      }

      if (qrCodeObj) {
        referenceId = String(qrCodeObj.reference_id || "");
        qrCodeId = String(qrCodeObj.id || "");
        amount = parseFloat(qrCodeObj.amount || 0);
        
        const metadata = qrCodeObj.metadata || {};
        nickname = String(metadata.nickname || "Anonymous").trim();
        message = String(metadata.message || "").trim();
      }
    }

    if (!Utils.isValidReferenceId(referenceId)) {
      Utils.safeLog("[SECURITY_ALERT] Rejected Webhook with malformed Reference ID", "WARNING", referenceId);
      return Router.createJsonResponse({ error: "Invalid reference ID format." }, 400);
    }

    const cache = GAS_.getScriptCache();
    const lock = GAS_.getScriptLock();
    try {
      if (!lock.tryLock(4000)) {
        return Router.createJsonResponse({ error: "Lock timeout. Please try again." }, 429);
      }
      
      const idempotencyKey = "webhook_lock_" + referenceId;
      const isWebhookProcessing = cache.get(idempotencyKey);
      if (isWebhookProcessing !== null) {
        return Router.createJsonResponse({ status: "skipped due to duplicate transaction" }, 200);
      }
      cache.put(idempotencyKey, "processing", 30); 
    } finally {
      lock.releaseLock();
    }

    const cleanStatus = Utils.sanitizeLogString(status);
    const isSuccess = (cleanStatus === "SUCCEEDED" || cleanStatus === "COMPLETED" || cleanStatus === "PAID" || payload.event === "qr.payment");
    
    if (isSuccess) {
      if (qrCodeId && PaymentGateway.verifyPaymentDirectlyWithXendit(qrCodeId)) {
        const cleanNickname = Utils.encodeHtmlEntities(nickname || "Anonymous");
        const cleanMessage = Utils.encodeHtmlEntities(message || "");
        
        const paidData = {
          id: referenceId,
          nickname: cleanNickname,
          message: cleanMessage,
          amount: amount,
          status: "PAID",
          created_at: new Date().toISOString()
        };

        const requests = [];
        const dbPayload = DatabaseService.saveToFirebasePayload(referenceId, paidData);
        requests.push(dbPayload);
        
        let includeStreamlabs = false;
        if (config.STREAMLABS_ACCESS_TOKEN) {
          const streamlabsDomain = "streamlabs.com";
          if (CircuitBreaker.getState(streamlabsDomain) !== "OPEN") {
            const alertPayload = AlertService.getStreamlabsAlertPayload(
              config.STREAMLABS_ACCESS_TOKEN, 
              cleanNickname, 
              amount, 
              cleanMessage
            );
            requests.push(alertPayload);
            includeStreamlabs = true;
          } else {
            Utils.safeLog("[CIRCUIT_BREAKER] Skipping Streamlabs Alert due to OPEN circuit.", "WARNING", "");
          }
        }

        let responses;
        try {
          responses = GAS_.fetchAll(requests);
        } catch (err) {
          requests.forEach(function(req) {
            const d = Utils.getDomain(req.url);
            CircuitBreaker.recordFailure(d);
          });
          throw err;
        }
        
        const dbResponse = responses[0];
        const dbDomain = Utils.getDomain(dbPayload.url);
        if (dbResponse.getResponseCode() === 200 || dbResponse.getResponseCode() === 201) {
          CircuitBreaker.recordSuccess(dbDomain);
        } else {
          CircuitBreaker.recordFailure(dbDomain);
          Utils.safeLog("[DATABASE_ERROR] Failed to save transaction history to Firebase.", "ERROR", dbResponse.getContentText());
          return Router.createJsonResponse({ error: "Failed to update transaction records." }, 500);
        }
        
        if (includeStreamlabs && responses.length > 1) {
          const slResponse = responses[1];
          const slDomain = "streamlabs.com";
          if (slResponse.getResponseCode() === 200 || slResponse.getResponseCode() === 201) {
            CircuitBreaker.recordSuccess(slDomain);
          } else {
            CircuitBreaker.recordFailure(slDomain);
            Utils.safeLog("[STREAMLABS_WARN] Streamlabs Notification alert triggered a non-200 response.", "WARNING", slResponse.getContentText());
          }
        }

        Utils.safeLog("[PAYMENT_SUCCESS] Parallel synchronization completed successfully.", "INFO", referenceId);
      } else {
        Utils.safeLog("[SECURITY_ALERT] Webhook validation failed: verification with payment provider returned false", "WARNING", referenceId);
        return Router.createJsonResponse({ error: "Transaction verification failed." }, 400);
      }
    }

    return Router.createJsonResponse({ status: "processed" }, 200);
  } catch (err) {
    Utils.safeLog("[WEBHOOK_CRITICAL_EXCEPTION]", "ERROR", err);
    return Router.createJsonResponse({ error: "Internal Server Error" }, 500);
  }
}

const Router = {
  createJsonResponse: function(data, responseCode) {
    return ContentService.createTextOutput(JSON.stringify(data))
                         .setMimeType(ContentService.MimeType.JSON);
  }
};
