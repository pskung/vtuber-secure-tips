// =========================================================================
// 🗄️ FIREBASE DATABASE & CLEANUP MODULE (src/DatabaseService.gs)
// =========================================================================

const DatabaseService = {
  saveToFirebasePayload: function(referenceId, paidData, gasProvider) {
    const provider = gasProvider || GAS_;
    const config = Config.get(provider);
    let targetDbUrl = config.FIREBASE_DB_URL + "donations/" + referenceId + ".json";
    const dbHeaders = {};
    
    if (config.FIREBASE_SECRET && config.FIREBASE_SECRET.trim() !== "" && config.FIREBASE_SECRET !== "your_firebase_legacy_database_secret_if_applicable") {
      targetDbUrl += "?auth=" + encodeURIComponent(config.FIREBASE_SECRET);
    } else {
      dbHeaders["Authorization"] = "Bearer " + ScriptApp.getOAuthToken();
    }
    
    return {
      url: targetDbUrl,
      method: "put",
      headers: dbHeaders,
      contentType: "application/json",
      payload: JSON.stringify(paidData),
      muteHttpExceptions: true
    };
  },

  cleanupExpiredDonations: function(gasProvider) {
    const provider = gasProvider || GAS_;
    try {
      const config = Config.get(provider);
      const dbUrl = config.FIREBASE_DB_URL;
      const dbSecret = config.FIREBASE_SECRET;

      if (!dbUrl) {
        Utils.safeLog("[CLEANUP_ERROR] Missing DB target reference for retention policy.", "ERROR", "", provider);
        return;
      }

      const cutoffTimeIso = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString();
      let url = dbUrl + "donations.json?orderBy=\"created_at\"&endAt=\"" + encodeURIComponent(cutoffTimeIso) + "\"&limitToFirst=40";
      
      const dbHeaders = {};
      if (dbSecret && dbSecret.trim() !== "" && dbSecret !== "your_firebase_legacy_database_secret_if_applicable") {
        url += "&auth=" + encodeURIComponent(dbSecret);
      } else {
        dbHeaders["Authorization"] = "Bearer " + ScriptApp.getOAuthToken();
      }
                  
      const response = provider.fetch(url, { method: "get", headers: dbHeaders, muteHttpExceptions: true });

      if (response.getResponseCode() !== 200) {
        Utils.safeLog("[CLEANUP_ERROR] Data query for dynamic pruning failed.", "ERROR", response.getContentText(), provider);
        return;
      }

      const expiredDonations = JSON.parse(response.getContentText());
      if (!expiredDonations || Object.keys(expiredDonations).length === 0) {
        Utils.safeLog("[CLEANUP_INFO] Scheduled cleanup complete. No data older than 30 days found.", "INFO", "", provider);
        return; 
      }

      const deleteRequests = [];
      for (let refId in expiredDonations) {
        let deleteUrl = dbUrl + "donations/" + refId + ".json";
        if (dbSecret && dbSecret.trim() !== "" && dbSecret !== "your_firebase_legacy_database_secret_if_applicable") {
          deleteUrl += "?auth=" + encodeURIComponent(dbSecret);
        }
        deleteRequests.push({
          url: deleteUrl,
          method: "delete",
          headers: dbHeaders,
          muteHttpExceptions: true
        });
      }

      let deleteCount = 0;
      if (deleteRequests.length > 0) {
        const responses = provider.fetchAll(deleteRequests);
        responses.forEach(function(res) {
          if (res.getResponseCode() === 200) {
            deleteCount++;
          }
        });
      }

      Utils.safeLog("[CLEANUP_SUCCESS] PDPA Compliance: Successfully pruned " + deleteCount + " records from datastore.", "INFO", "", provider);
    } catch (err) {
      Utils.safeLog("[CLEANUP_CRITICAL_FAILURE] Failed to execute scheduled database retention pruning.", "ERROR", err, provider);
    }
  }
};
