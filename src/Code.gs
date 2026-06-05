// =========================================================================
// 🌉 GLOBAL ENTRYPOINT & CONTAINER-BOUND BRIDGE (src/Code.gs)
// =========================================================================

function onOpen() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().addMenu("⚙️ VTuber Gateway Config", [
      { name: "🔑 Configure Keys & Secrets", functionName: "showConfigSidebar" }
    ]);
  } catch (err) {}
}

function showConfigSidebar() {
  const currentConfig = Config.get();
  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; padding: 18px; color: #1e293b; max-width: 360px;">
      <h3 style="color: #10b981; margin-top: 0; font-size: 16px;">🔑 Credentials Configuration</h3>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">FIREBASE DATABASE URL:</label>
        <input type="text" id="firebase_url" value="${currentConfig.FIREBASE_DB_URL || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px;">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">XENDIT SECRET KEY:</label>
        <input type="password" id="xendit_key" value="${currentConfig.XENDIT_SECRET_KEY || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px;">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">STREAMLABS ACCESS TOKEN:</label>
        <input type="password" id="streamlabs_token" value="${currentConfig.STREAMLABS_ACCESS_TOKEN || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px;">
      </div>

      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">WEBHOOK VERIFICATION TOKEN:</label>
        <input type="password" id="webhook_token" value="${currentConfig.WEBHOOK_VERIFICATION_TOKEN || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; font-weight: bold; color: #475569;">DPO EMAIL (Privacy Contact):</label>
        <input type="email" id="dpo_email" value="${currentConfig.DPO_EMAIL || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px;">
      </div>

      <button id="save-btn" onclick="saveSecretsToServer()" style="background-color: #10b981; color: #ffffff; border: none; padding: 12px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold;">Save Configuration</button>
      <p id="status-text" style="font-size: 12px; text-align: center; color: #059669; margin-top: 10px;"></p>
    </div>

    <script>
      function saveSecretsToServer() {
        const btn = document.getElementById('save-btn');
        btn.disabled = true;
        const payload = {
          FIREBASE_DB_URL: document.getElementById('firebase_url').value,
          XENDIT_SECRET_KEY: document.getElementById('xendit_key').value,
          STREAMLABS_ACCESS_TOKEN: document.getElementById('streamlabs_token').value,
          WEBHOOK_VERIFICATION_TOKEN: document.getElementById('webhook_token').value,
          DPO_EMAIL: document.getElementById('dpo_email').value
        };
        google.script.run.withSuccessHandler(() => {
          document.getElementById('status-text').innerHTML = "✅ Updated successfully!";
          btn.textContent = 'Saved';
        }).saveUserSecrets(payload);
      }
    </script>
  `;
  SpreadsheetApp.getUi().showSidebar(HtmlService.createHtmlOutput(htmlContent).setTitle("VTuber Gateway Manager").setWidth(320));
}

function saveUserSecrets(payload) {
  const properties = PropertiesService.getScriptProperties();
  if (!payload.FIREBASE_DB_URL || !payload.XENDIT_SECRET_KEY) throw new Error("Missing mandatory fields.");
  
  const existingKey = properties.getProperty("SIGNING_SECRET_KEY");
  const finalSigningKey = existingKey || (Utilities.getUuid() + Utilities.getUuid());
  
  properties.setProperties({
    FIREBASE_DB_URL: payload.FIREBASE_DB_URL.trim().replace(/\/$/, "") + "/",
    XENDIT_SECRET_KEY: payload.XENDIT_SECRET_KEY.trim(),
    STREAMLABS_ACCESS_TOKEN: (payload.STREAMLABS_ACCESS_TOKEN || "").trim(),
    WEBHOOK_VERIFICATION_TOKEN: payload.WEBHOOK_VERIFICATION_TOKEN ? payload.WEBHOOK_VERIFICATION_TOKEN.trim() : "secure_token_random_32_characters_minimum",
    SIGNING_SECRET_KEY: finalSigningKey,
    DPO_EMAIL: payload.DPO_EMAIL ? payload.DPO_EMAIL.trim() : Session.getActiveUser().getEmail(),
    CIRCUIT_BREAKER_COOLDOWN_SEC: "30" 
  });
  Config_ = null;
}
