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
      POW_DIFFICULTY: 3, 
      DPO_EMAIL: props.DPO_EMAIL || "dpo@yourstreamdomain.com",
      CIRCUIT_BREAKER_COOLDOWN_SEC: 30, 
      XENDIT_SECRET_KEY: props.XENDIT_SECRET_KEY || "",
      STREAMLABS_ACCESS_TOKEN: props.STREAMLABS_ACCESS_TOKEN || "",
      WEBHOOK_VERIFICATION_TOKEN: props.WEBHOOK_VERIFICATION_TOKEN || "",
      SIGNING_SECRET_KEY: props.SIGNING_SECRET_KEY || ""
    };
    
    return Config_;
  },
  
  getSigningSecretKey: function(gasProvider) {
    const key = this.get(gasProvider).SIGNING_SECRET_KEY;
    if (!key || key.length < 32) {
      throw new Error("Security Violation: SIGNING_SECRET_KEY is missing. Please save configuration first.");
    }
    return key;
  }
};
