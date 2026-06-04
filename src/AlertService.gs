// =========================================================================
// 🔔 ALERT NOTIFICATION MODULE (src/AlertService.gs)
// =========================================================================

const AlertService = {
  getStreamlabsAlertPayload: function(accessToken, nickname, amount, message) {
    const alertUrl = "https://streamlabs.com/api/v2.0/alerts";
    const alertText = "*" + nickname + "* tipped you *" + amount.toFixed(2) + " THB*! \\n " + message;
    
    return {
      url: alertUrl,
      method: "post",
      headers: { "Authorization": "Bearer " + accessToken },
      payload: {
        "type": "donation",
        "message": alertText,
        "duration": 8000,
        "special_text_color": "#10B981" 
      },
      muteHttpExceptions: true
    };
  }
};
