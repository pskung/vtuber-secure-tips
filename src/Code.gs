// =========================================================================
// 🌉 GLOBAL ENTRYPOINT & CONTAINER-BOUND BRIDGE (src/Code.gs)
// =========================================================================

/**
 * Triggered automatically when the bound Google Sheet is opened by the owner.
 * Creates an admin custom menu to access configuration dialog.
 */
function onOpen() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().addMenu("⚙️ VTuber Gateway Config", [
      { name: "🔑 Configure Keys & Secrets", functionName: "showConfigSidebar" }
    ]);
  } catch (err) {
    // Graceful fail if accessed outside the standard container context
  }
}

/**
 * Renders an English configuration UI sidebar for the administrator.
 */
function showConfigSidebar() {
  const currentConfig = Config.get();
  
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; padding: 18px; color: #1e293b; max-width: 360px;">
      <h3 style="color: #10b981; margin-top: 0; font-size: 16px;">🔑 Credentials & Secrets Configuration</h3>
      <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">
        Fill in your private credentials here. These secrets are saved securely inside the project Script Properties.
      </p>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">FIREBASE DATABASE URL:</label>
        <input type="text" id="firebase_url" value="${currentConfig.FIREBASE_DB_URL || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; margin-top: 4px;" placeholder="https://your-project.firebasedatabase.app/">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">FIREBASE SECRET KEY (Legacy/Optional):</label>
        <input type="password" id="firebase_secret" value="${currentConfig.FIREBASE_SECRET || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; margin-top: 4px;">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">XENDIT SECRET KEY:</label>
        <input type="password" id="xendit_key" value="${currentConfig.XENDIT_SECRET_KEY || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; margin-top: 4px;" placeholder="xnd_live_...">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">STREAMLABS ACCESS TOKEN:</label>
        <input type="password" id="streamlabs_token" value="${currentConfig.STREAMLABS_ACCESS_TOKEN || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; margin-top: 4px;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">WEBHOOK VERIFICATION TOKEN (Min 32 characters):</label>
        <input type="password" id="webhook_token" value="${currentConfig.WEBHOOK_VERIFICATION_TOKEN || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; margin-top: 4px;">
      </div>

      <button id="save-btn" onclick="saveSecretsToServer()" style="background-color: #10b981; color: #ffffff; border: none; padding: 12px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold; font-size: 13px;">Save Configuration</button>
      <p id="status-text" style="font-size: 12px; text-align: center; color: #059669; font-weight: bold; margin-top: 10px;"></p>
    </div>

    <script>
      function saveSecretsToServer() {
        const btn = document.getElementById('save-btn');
        btn.disabled = true;
        btn.textContent = 'Saving ...';
        
        const payload = {
          FIREBASE_DB_URL: document.getElementById('firebase_url').value,
          FIREBASE_SECRET: document.getElementById('firebase_secret').value,
          XENDIT_SECRET_KEY: document.getElementById('xendit_key').value,
          STREAMLABS_ACCESS_TOKEN: document.getElementById('streamlabs_token').value,
          WEBHOOK_VERIFICATION_TOKEN: document.getElementById('webhook_token').value
        };
        
        google.script.run
          .withSuccessHandler(function() {
            document.getElementById('status-text').innerHTML = "✅ Configuration successfully updated!<br>You can now close this sidebar.";
            btn.textContent = 'Saved Successfully';
          })
          .withFailureHandler(function(err) {
            document.getElementById('status-text').textContent = "❌ Error: " + err.message;
            btn.disabled = false;
            btn.textContent = 'Retry Save';
          })
          .saveUserSecrets(payload);
      }
    </script>
  `;
  
  const uiSidebar = HtmlService.createHtmlOutput(htmlContent)
                               .setTitle("VTuber Gateway Manager")
                               .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(uiSidebar);
}

/**
 * Securely writes form configuration data directly into Script Properties.
 * @param {Object} payload User provided credentials
 */
function saveUserSecrets(payload) {
  const properties = PropertiesService.getScriptProperties();
  
  if (!payload.FIREBASE_DB_URL || !payload.XENDIT_SECRET_KEY) {
    throw new Error("Validation Error: Firebase DB URL and Xendit Secret Key are mandatory parameters.");
  }
  
  // Generating a cryptographically random HMAC secret key automatically for session signing
  const signingKey = properties.getProperty("SIGNING_SECRET_KEY") || Utilities.getUuid() + Utilities.getUuid();
  
  properties.setProperties({
    FIREBASE_DB_URL: payload.FIREBASE_DB_URL.trim().replace(/\/$/, "") + "/",
    FIREBASE_SECRET: payload.FIREBASE_SECRET ? payload.FIREBASE_SECRET.trim() : "",
    XENDIT_SECRET_KEY: payload.XENDIT_SECRET_KEY.trim(),
    STREAMLABS_ACCESS_TOKEN: payload.STREAMLABS_ACCESS_TOKEN ? payload.STREAMLABS_ACCESS_TOKEN.trim() : "",
    WEBHOOK_VERIFICATION_TOKEN: payload.WEBHOOK_VERIFICATION_TOKEN ? payload.WEBHOOK_VERIFICATION_TOKEN.trim() : "secure_token_random_32_characters_minimum",
    SIGNING_SECRET_KEY: signingKey,
    POW_DIFFICULTY: "3", 
    DPO_EMAIL: Session.getActiveUser().getEmail(), // Automatically inject owner's email as the default privacy contact
    CIRCUIT_BREAKER_COOLDOWN_SEC: "30"
  });
  
  // Reset Config global memory cache to enforce fresh reload
  Config_ = null;
}

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
