// =========================================================================
// 🛡️ SECURITY MODULE (src/Security.gs)
// =========================================================================

const SecurityService = {
  verifyProofOfWork: function(fingerprint, timestamp, nonce, difficulty) {
    const input = fingerprint + "_" + timestamp + "_" + nonce;
    const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
    
    let hexHash = "";
    for (let i = 0; i < rawHash.length; i++) {
      let byteValue = rawHash[i];
      if (byteValue < 0) byteValue += 256;
      let byteString = byteValue.toString(16);
      if (byteString.length == 1) byteString = "0" + byteString;
      hexHash += byteString;
    }
    
    const prefix = "0".repeat(difficulty);
    return hexHash.indexOf(prefix) === 0;
  },

  initializeSession: function(clientFingerprint, clientTimestamp, clientNonce, gasProvider) {
    const provider = gasProvider || GAS_;
    try {
      const cleanFingerprint = String(clientFingerprint || "").trim();
      if (!/^[a-zA-Z0-9.\-_=]+$/.test(cleanFingerprint) || cleanFingerprint.length < 10 || cleanFingerprint.length > 128) {
        return { success: false, message: "Security Validation Failed." };
      }

      const now = new Date().getTime();
      const timestampInt = parseInt(clientTimestamp, 10);
      if (isNaN(timestampInt) || Math.abs(now - timestampInt) > 60000) { 
        return { success: false, message: "Session timeline out of sync." };
      }

      const config = Config.get(provider);
      const difficulty = config.POW_DIFFICULTY || 3;

      if (!this.verifyProofOfWork(cleanFingerprint, clientTimestamp, clientNonce, difficulty)) {
        return { success: false, message: "Handshake computation proof invalid." };
      }

      const cache = provider.getScriptCache();
      
      // 🛡️ DUAL-LAYER THROTTLING: Prevents client rate-limit bypass via fingerprint rotating
      const rateLimitKey = "rl_handshake_" + cleanFingerprint;
      const globalRateLimitKey = "rl_global_handshake_spike";
      
      const currentRate = cache.get(rateLimitKey);
      let requestCount = currentRate ? parseInt(currentRate, 10) : 0;
      if (requestCount >= 10) { 
        return { success: false, message: "Device request rate exceeded. Please wait 1 minute before trying again." };
      }

      const globalRate = cache.get(globalRateLimitKey);
      let globalCount = globalRate ? parseInt(globalRate, 10) : 0;
      if (globalCount > 150) { 
        return { success: false, message: "System is experiencing heavy traffic. Please wait 10 seconds and try again." };
      }

      const lock = provider.getScriptLock();
      let isAllowed = false;
      
      try {
        if (lock.tryLock(2000)) {
          const activeRequestsJson = cache.get("active_execution_timestamps") || "[]";
          let activeTimestamps = [];
          try {
            activeTimestamps = JSON.parse(activeRequestsJson);
          } catch (e) {
            activeTimestamps = [];
          }
          
          activeTimestamps = activeTimestamps.filter(function(t) { return now - t < 3000; });
          
          if (activeTimestamps.length < 25) {
            activeTimestamps.push(now);
            cache.put("active_execution_timestamps", JSON.stringify(activeTimestamps), 10);
            isAllowed = true;
          }
        }
      } finally {
        lock.releaseLock();
      }

      if (!isAllowed) {
        return { success: false, message: "System concurrent queue is full. Please try again shortly." };
      }

      requestCount++;
      globalCount++;
      
      cache.put(rateLimitKey, String(requestCount), 60); // 1-minute client block
      cache.put(globalRateLimitKey, String(globalCount), 10); // 10-second global window throttle

      const tokenId = Utilities.getUuid();
      const payload = tokenId + "." + now;
      const key = Config.getSigningSecretKey(provider);
      const signatureBytes = Utilities.computeHmacSha256Signature(payload, key);
      const signatureBase64 = Utilities.base64Encode(signatureBytes);
      
      return {
        success: true,
        sessionToken: payload + "." + signatureBase64
      };
    } catch (err) {
      Utils.safeLog("[INIT_SESSION_ERROR] Handshake session initialization failed.", "ERROR", err, provider);
      return { success: false, message: "Handshake process aborted." };
    }
  },

  verifyAndConsumeToken: function(signedToken, gasProvider) {
    const provider = gasProvider || GAS_;
    try {
      if (!signedToken || typeof signedToken !== 'string') return false;
      
      const parts = signedToken.split('.');
      if (parts.length !== 3) return false;
      
      const tokenId = parts[0];
      const timestampStr = parts[1];
      const incomingSignature = parts[2];
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(tokenId)) return false;
      
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp)) return false;
      
      const now = new Date().getTime();
      if (now - timestamp > 5 * 60 * 1000 || now < timestamp) {
        return false; 
      }
      
      const payload = tokenId + "." + timestampStr;
      const key = Config.getSigningSecretKey(provider);
      const expectedSignatureBytes = Utilities.computeHmacSha256Signature(payload, key);
      const expectedSignature = Utilities.base64Encode(expectedSignatureBytes);
      
      if (!this.safeCompare(incomingSignature, expectedSignature)) return false; 
      
      const lock = provider.getScriptLock();
      try {
        if (!lock.tryLock(5000)) return false; 
        
        const cache = provider.getScriptCache();
        const cacheKey = "token_" + tokenId;
        const isUsed = cache.get(cacheKey);
        
        if (isUsed !== null) return false; 
        
        const rawRemaining = Math.ceil((5 * 60 * 1000 - (now - timestamp)) / 1000);
        const remainingTimeSec = Math.max(30, Math.min(300, rawRemaining));
        cache.put(cacheKey, "consumed", remainingTimeSec);
        return true;
      } finally {
        lock.releaseLock(); 
      }
    } catch (err) {
      Utils.safeLog("[VERIFY_TOKEN_ERROR] Cryptographic signature token validation failed.", "ERROR", err, provider);
      return false;
    }
  },

  safeCompare: function(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return false;
    if (str1.length !== str2.length) return false;
    let result = 0;
    for (let i = 0; i < str1.length; i++) {
      result |= str1.charCodeAt(i) ^ str2.charCodeAt(i);
    }
    return result === 0;
  }
};
