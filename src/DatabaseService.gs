// =========================================================================
// 🗄️ FIREBASE DATABASE & CLEANUP MODULE (src/DatabaseService.gs)
// =========================================================================

const DatabaseService = {
  saveToFirebasePayload: function(referenceId, paidData, gasProvider) {
    const provider = gasProvider || GAS_;
    const config = Config.get(provider);
    return {
      url: config.FIREBASE_DB_URL + "donations/" + referenceId + ".json",
      method: "put",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      contentType: "application/json",
      payload: JSON.stringify(paidData),
      muteHttpExceptions: true
    };
  },

  cleanupExpiredDonations: function(gasProvider) {
    const provider = gasProvider || GAS_;
    try {
      const config = Config.get(provider);
      if (!config.FIREBASE_DB_URL) return;
      const cutoffTimeIso = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString();
      const url = config.FIREBASE_DB_URL + "donations.json?orderBy=\"created_at\"&endAt=\"" + encodeURIComponent(cutoffTimeIso) + "\"&limitToFirst=40";
      const response = provider.fetch(url, { 
        method: "get", 
        headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() }, 
        muteHttpExceptions: true 
      });
      if (response.getResponseCode() !== 200) return;
      const expiredDonations = JSON.parse(response.getContentText());
      if (!expiredDonations) return;
      const deleteRequests = Object.keys(expiredDonations).map(refId => ({
        url: config.FIREBASE_DB_URL + "donations/" + refId + ".json",
        method: "delete",
        headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      }));
      const responses = provider.fetchAll(deleteRequests);
      Utils.safeLog("[CLEANUP_SUCCESS] PDPA: Pruned " + responses.filter(res => res.getResponseCode() === 200).length + " records.", "INFO", "", provider);
    } catch (err) {
      Utils.safeLog("[CLEANUP_ERROR] Retention pruning failed.", "ERROR", err, provider);
    }
  }
};
