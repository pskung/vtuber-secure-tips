// =========================================================================
// ⚙️ CONFIG MODULE (src/Config.gs)
// =========================================================================

var Config_ = null; // Memory cache placeholder

const Config = {
  /**
   * Reads, processes and caches platform variables.
   * @param {Object} [gasProvider] Dynamic dependency injection provider
   * @returns {Object} Application configuration parameters
   */
  get: function(gasProvider) {
    const provider = gasProvider || GAS_;
    if (Config_ !== null) return Config_;
    
    const cache = provider.getScriptCache();
    const cacheKey = "app_non_sensitive_config";
    let baseConfig = {};
    
    try {
      const cachedData = cache.get(cacheKey);
      if (cachedData) baseConfig = JSON.parse(cachedData);
    } catch (err) {
      Utils.safeLog("[CACHE_READ_WARN] Could not retrieve cached config structures", "WARNING", err.toString(), provider);
    }
    
    if (!baseConfig.FIREBASE_DB_URL) {
      const props = provider.getProperties();
      baseConfig = { 
        FIREBASE_DB_URL: props.FIREBASE_DB_URL || "",
        POW_DIFFICULTY: parseInt(props.POW_DIFFICULTY || "3", 10),
        DPO_EMAIL: props.DPO_EMAIL || "dpo@yourstreamdomain.com",
        CIRCUIT_BREAKER_COOLDOWN_SEC: parseInt(props.CIRCUIT_BREAKER_COOLDOWN_SEC || "30", 10)
      };
      try {
        cache.put(cacheKey, JSON.stringify(baseConfig), 600); // Cache non-sensitive variables for 10 minutes
      } catch (e) {}
    }
    
    const secretProps = provider.getProperties();
    Config_ = {
      FIREBASE_DB_URL: baseConfig.FIREBASE_DB_URL,
      POW_DIFFICULTY: baseConfig.POW_DIFFICULTY,
      DPO_EMAIL: baseConfig.DPO_EMAIL,
      CIRCUIT_BREAKER_COOLDOWN_SEC: baseConfig.CIRCUIT_BREAKER_COOLDOWN_SEC,
      FIREBASE_SECRET: secretProps.FIREBASE_SECRET || "",
      XENDIT_SECRET_KEY: secretProps.XENDIT_SECRET_KEY || "",
      STREAMLABS_ACCESS_TOKEN: secretProps.STREAMLABS_ACCESS_TOKEN || "",
      WEBHOOK_VERIFICATION_TOKEN: secretProps.WEBHOOK_VERIFICATION_TOKEN || "",
      SIGNING_SECRET_KEY: secretProps.SIGNING_SECRET_KEY || ""
    };
    
    return Config_;
  },
  
  getSigningSecretKey: function(gasProvider) {
    const provider = gasProvider || GAS_;
    const config = this.get(provider);
    const key = config.SIGNING_SECRET_KEY;
    if (!key || key.length < 32) {
      Utils.safeLog("[SECURITY_CRITICAL] SIGNING_SECRET_KEY is insecure or unset", "CRITICAL", "", provider);
      throw new Error("Security Violation: SIGNING_SECRET_KEY must be configured with at least 32 characters.");
    }
    return key;
  }
};
