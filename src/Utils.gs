// =========================================================================
// 🛠️ UTILS & SANITIZER MODULE (src/Utils.gs)
// =========================================================================

var GAS_ = {
  getProperties: function() { return PropertiesService.getScriptProperties().getProperties(); },
  setProperty: function(key, val) { PropertiesService.getScriptProperties().setProperty(key, val); },
  getScriptCache: function() { return CacheService.getScriptCache(); },
  getScriptLock: function() { return LockService.getScriptLock(); },
  
  fetch: function(url, params) { 
    const domain = Utils.getDomain(url);
    return CircuitBreaker.execute(domain, function() {
      return UrlFetchApp.fetch(url, params);
    }, this); 
  },
  
  fetchAll: function(reqs) { 
    return UrlFetchApp.fetchAll(reqs); 
  }
};

const Utils = {
  getDomain: function(url) {
    if (!url) return "unknown";
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
    return match ? match[1] : "unknown";
  },

  encodeHtmlEntities: function(str) {
    if (!str) return "";
    return str.toString()
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#x27;")
              .replace(/\//g, "&#x2F;")
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); 
  },

  validateNickname: function(nickname) {
    if (typeof nickname !== 'string') return false;
    const len = nickname.length;
    if (len < 2 || len > 25) return false;
    return /^[a-zA-Z0-9\u0e00-\u0e7f\s._-]+$/.test(nickname);
  },

  isValidReferenceId: function(refId) {
    return /^donation-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refId);
  },

  sanitizeLogString: function(str) {
    if (!str) return "";
    return str.toString().replace(/[\r\n\t]/g, "").trim();
  },

  createValidationError: function(msg) {
    return { success: false, isValidationError: true, message: String(msg) };
  },

  safeLog: function(message, severity, untrustedInput, gasProvider) {
    const provider = gasProvider || GAS_;
    const cleanMessage = this.sanitizeLogString(message);
    let cleanInput = "";

    if (untrustedInput instanceof Error) {
      cleanInput = this.sanitizeLogString(untrustedInput.stack || untrustedInput.toString());
    } else if (untrustedInput && typeof untrustedInput === 'object') {
      try {
        cleanInput = this.sanitizeLogString(JSON.stringify(untrustedInput));
      } catch (e) {
        cleanInput = this.sanitizeLogString(untrustedInput.toString());
      }
    } else {
      cleanInput = this.sanitizeLogString(untrustedInput);
    }

    const config = Config.get(provider);
    const secretsToMask = [
      config.FIREBASE_SECRET,
      config.XENDIT_SECRET_KEY,
      config.STREAMLABS_ACCESS_TOKEN,
      config.WEBHOOK_VERIFICATION_TOKEN,
      config.SIGNING_SECRET_KEY
    ];

    secretsToMask.forEach(function(secret) {
      if (secret && secret.length > 5) {
        const escapedSecret = secret.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedSecret, 'g');
        cleanInput = cleanInput.replace(regex, "[SYSTEM_SECRET_MASKED]");
      }
    });
    
    cleanInput = cleanInput.replace(/(ey[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g, "[JWT_MASKED]");
    cleanInput = cleanInput.replace(/(xnd_(live|test)_[a-zA-Z0-9]{20,})/g, "[API_KEY_MASKED]");
    
    const logData = {
      timestamp: new Date().toISOString(),
      service: "VTUBER-SECURE-ENGINE",
      severity: severity || "INFO",
      message: cleanMessage,
      context: cleanInput.replace(/[\p{Cc}\p{Cf}]/gu, "") 
    };
    
    if (severity === "ERROR" || severity === "CRITICAL") {
      console.error(JSON.stringify(logData));
    } else if (severity === "WARNING") {
      console.warn(JSON.stringify(logData));
    } else {
      console.log(JSON.stringify(logData));
    }
  }
};
