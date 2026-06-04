// =========================================================================
// 🔌 CIRCUIT BREAKER SERVICE (src/CircuitBreaker.gs)
// =========================================================================

const CircuitBreaker = {
  /**
   * Internal Helper: Reads the combined JSON circuit state store.
   */
  _getStore: function(provider) {
    const cache = provider.getScriptCache();
    const rawStore = cache.get("cb_global_store");
    if (!rawStore) return {};
    try {
      return JSON.parse(rawStore);
    } catch (e) {
      return {};
    }
  },

  /**
   * Internal Helper: Writes state changes back to the combined cache store.
   * Cleans up (Garbage Collects) inactive/stale closed domain states to preserve cache memory.
   */
  _saveStore: function(store, provider) {
    const cache = provider.getScriptCache();
    try {
      const cleanedStore = {};
      const now = Date.now();
      const config = Config.get(provider);
      const cooldownMs = (config.CIRCUIT_BREAKER_COOLDOWN_SEC || 30) * 1000;

      for (let apiName in store) {
        const apiData = store[apiName];
        const isStaleClosed = (apiData.state === "CLOSED" && (!apiData.trip_time || now - apiData.trip_time > cooldownMs * 10));
        
        if (!isStaleClosed) {
          cleanedStore[apiName] = apiData;
        }
      }

      const serialized = JSON.stringify(cleanedStore);
      if (serialized.length < 100000) { // Protect against the 100KB Cache Limit
        cache.put("cb_global_store", serialized, 600);
      } else {
        Utils.safeLog("[CIRCUIT_BREAKER_CRITICAL] Global state store exceeded 100KB limit. Resetting store.", "CRITICAL", "", provider);
        cache.put("cb_global_store", JSON.stringify({}), 600);
      }
    } catch (e) {
      Utils.safeLog("[CIRCUIT_BREAKER_WRITE_ERROR] Failed to update aggregated global cache store.", "WARNING", e.toString(), provider);
    }
  },

  getState: function(apiName, gasProvider) {
    const provider = gasProvider || GAS_;
    const lock = provider.getScriptLock();
    let state = "CLOSED";
    
    try {
      if (lock.tryLock(1500)) {
        const store = this._getStore(provider);
        if (store[apiName]) {
          state = store[apiName].state || "CLOSED";
        }
      }
    } finally {
      lock.releaseLock();
    }
    return state;
  },

  checkCircuit: function(apiName, gasProvider) {
    const provider = gasProvider || GAS_;
    const lock = provider.getScriptLock();
    const config = Config.get(provider);
    const cooldownMs = (config.CIRCUIT_BREAKER_COOLDOWN_SEC || 30) * 1000;
    
    let state = "CLOSED";
    try {
      if (lock.tryLock(2000)) {
        const store = this._getStore(provider);
        const apiData = store[apiName] || { state: "CLOSED", failures: 0, trip_time: 0 };
        state = apiData.state;
        
        if (state === "OPEN") {
          const tripTime = apiData.trip_time || 0;
          const now = Date.now();
          if (now - tripTime < cooldownMs) {
            Utils.safeLog("[CIRCUIT_BREAKER] Endpoint " + apiName + " is OPEN. Fast-failing requests.", "WARNING", "", provider);
            throw new Error("External Connection Temporarily Down (Circuit Breaker Tripped): Restricting requests for " + config.CIRCUIT_BREAKER_COOLDOWN_SEC + " seconds to allow downstream recovery.");
          } else {
            apiData.state = "HALF-OPEN";
            store[apiName] = apiData;
            this._saveStore(store, provider);
            Utils.safeLog("[CIRCUIT_BREAKER] Endpoint " + apiName + " transitioned to HALF-OPEN.", "INFO", "", provider);
            state = "HALF-OPEN";
          }
        }
      }
    } finally {
      lock.releaseLock();
    }
    return state;
  },

  recordFailure: function(apiName, gasProvider) {
    const provider = gasProvider || GAS_;
    const lock = provider.getScriptLock();
    const config = Config.get(provider);
    const cooldownSec = config.CIRCUIT_BREAKER_COOLDOWN_SEC || 30;
    
    try {
      if (lock.tryLock(2000)) {
        const store = this._getStore(provider);
        const apiData = store[apiName] || { state: "CLOSED", failures: 0, trip_time: 0 };
        
        apiData.failures = (apiData.failures || 0) + 1;
        Utils.safeLog("[CIRCUIT_BREAKER] Failure recorded for " + apiName + " (" + apiData.failures + "/3)", "WARNING", "", provider);
        
        if (apiData.failures >= 3) {
          apiData.state = "OPEN";
          apiData.trip_time = Date.now();
          Utils.safeLog("[CIRCUIT_BREAKER] 🚨 " + apiName + " failed 3 times consecutively. Tripping circuit to OPEN for " + cooldownSec + " seconds.", "CRITICAL", "", provider);
        }
        
        store[apiName] = apiData;
        this._saveStore(store, provider);
      }
    } finally {
      lock.releaseLock();
    }
  },

  recordSuccess: function(apiName, gasProvider) {
    const provider = gasProvider || GAS_;
    const lock = provider.getScriptLock();
    try {
      if (lock.tryLock(2000)) {
        const store = this._getStore(provider);
        const apiData = store[apiName] || { state: "CLOSED", failures: 0, trip_time: 0 };
        
        apiData.failures = 0;
        apiData.state = "CLOSED";
        apiData.trip_time = 0;
        
        store[apiName] = apiData;
        this._saveStore(store, provider);
      }
    } finally {
      lock.releaseLock();
    }
  },

  execute: function(apiName, fetchFn, gasProvider) {
    const provider = gasProvider || GAS_;
    this.checkCircuit(apiName, provider);
    
    try {
      const response = fetchFn();
      
      if (response && typeof response.getResponseCode === 'function') {
        const code = response.getResponseCode();
        if (code >= 200 && code < 300) {
          this.recordSuccess(apiName, provider);
          return response;
        } else {
          throw new Error("HTTP Response Status: " + code);
        }
      }
      
      this.recordSuccess(apiName, provider);
      return response;
    } catch (err) {
      this.recordFailure(apiName, provider);
      throw err;
    }
  }
};
