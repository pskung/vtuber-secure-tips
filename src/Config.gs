// =========================================================================
// ⚙️ CONFIG MODULE (src/Config.gs)
// =========================================================================

var Config_ = null; 

const Config = {
  get: function(gasProvider) {
    const provider = gasProvider || GAS_;
    if (Config_ !== null) return Config_;
    
    const props = provider.getProperties();
    
    Config_ = {
      FIREBASE_DB_URL: props.FIREBASE_DB_URL || "",
      POW_DIFFICULTY: props.POW_DIFFICULTY ? parseInt(props.POW_DIFFICULTY, 10) : 3, 
      DPO_EMAIL: props.DPO_EMAIL || "dpo@yourstreamdomain.com",
      CIRCUIT_BREAKER_COOLDOWN_SEC: props.CIRCUIT_BREAKER_COOLDOWN_SEC ? parseInt(props.CIRCUIT_BREAKER_COOLDOWN_SEC, 10) : 30, 
      XENDIT_SECRET_KEY: props.XENDIT_SECRET_KEY || "",
      STREAMLABS_ACCESS_TOKEN: props.STREAMLABS_ACCESS_TOKEN || "",
      WEBHOOK_VERIFICATION_TOKEN: props.WEBHOOK_VERIFICATION_TOKEN || "",
      SIGNING_SECRET_KEY: props.SIGNING_SECRET_KEY || ""
    };
    
    return Config_;
  },
  
  getSigningSecretKey: function(gasProvider) {
    const provider = gasProvider || GAS_;
    let key = this.get(provider).SIGNING_SECRET_KEY;
    
    // 🛡️ Auto-generate SIGNING_SECRET_KEY หากยังไม่ถูกสร้างขึ้น เพื่อประสบการณ์ใช้งาน (UX) ที่สะดวกของสตรีมเมอร์
    if (!key || key.length < 32) {
      const generatedKey = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, "");
      provider.setProperty("SIGNING_SECRET_KEY", generatedKey);
      
      // อัปเดตข้อมูลใน Cache ทันทีเพื่อป้องกัน Race Condition
      if (Config_) {
        Config_.SIGNING_SECRET_KEY = generatedKey;
      }
      key = generatedKey;
      Utils.safeLog("[SYSTEM_INIT] Automatically generated a secure SIGNING_SECRET_KEY and saved to Script Properties.", "INFO", "", provider);
    }
    return key;
  }
};
