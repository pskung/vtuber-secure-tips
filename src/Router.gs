// =========================================================================
// 🛣️ ROUTING & CONTROLLER MODULE (src/Router.gs)
// =========================================================================

function resolveTemplate(filename) {
  const paths = ['src/' + filename, filename];
  for (const path of paths) {
    try { return HtmlService.createTemplateFromFile(path); } catch (e) {}
  }
  throw new Error(`Template not found: ${filename}`);
}

function doGet(e) {
  try {
    const config = Config.get();
    const template = resolveTemplate('Index');
    template.powDifficulty = config.POW_DIFFICULTY || 3;
    template.dpoEmail = config.DPO_EMAIL || "dpo@yourstreamdomain.com";
    template.Utils = Utils; 
    const output = template.evaluate();
    output.setTitle("VTuber Tips Gateway (PDPA Compliant)");
    output.addMetaTag("viewport", "width=device-width, initial-scale=1");
    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
    return output;
  } catch (err) {
    Utils.safeLog("GET Request Rendering Failed", "CRITICAL", err);
    return HtmlService.createHtmlOutput("<h2>A temporary server-side execution error occurred. Please try again later.</h2>");
  }
}

function include(filename, templateData) {
  try {
    const template = resolveTemplate(filename);
    template.Utils = Utils;
    if (templateData && typeof templateData === 'object') Object.assign(template, templateData);
    return template.evaluate().getContent();
  } catch (err) {
    Utils.safeLog(`Include Error: ${filename}`, "ERROR", err);
    return "<!-- Error loading component -->";
  }
}

// doPost และ Router.createJsonResponse ใช้ของเดิมจาก src/Router.gs (ไม่ต้องแก้ไข)
