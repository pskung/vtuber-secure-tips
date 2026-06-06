// =========================================================================
// 🌉 GLOBAL ENTRYPOINT & DIRECTORY (src/Code.gs)
// =========================================================================
/**
 * ℹ️ เกี่ยวกับโครงการ (Project Overview)
 * VTuber Secure Tips - ระบบรับเงินสนับสนุนความปลอดภัยสูงตามกฎ PDPA
 * 
 * 📂 โครงสร้างไฟล์ในโครงการ:
 * - src/Router.gs          : ควบคุมการทำงานของเส้นทาง (doGet, doPost) และการแสดงผลหน้าเว็บ
 * - src/Config.gs          : จัดการดึงค่าคีย์สำคัญจาก Script Properties และระบบออโต้เจนคีย์ความปลอดภัย
 * - src/Security.gs        : ระบบคัดกรองบอท (Proof of Work) และระบบจำกัดอัตราคำขอ (Throttling)
 * - src/PaymentGateway.gs  : เชื่อมต่อ API กับฝั่ง Xendit เพื่อสร้าง PromptPay QR Code
 * - src/AlertService.gs    : ส่งการแจ้งเตือนไปยังหน้าจอไลฟ์สตรีมผ่าน Streamlabs API
 * - src/DatabaseService.gs : บันทึกประวัติและตัวล้างข้อมูลอัตโนมัติ 30 วัน (Firebase)
 * - src/Utils.gs           : ฟังก์ชันอำนวยความสะดวกทั่วไปและตัวกรอง Log ความปลอดภัย
 * 
 * ⚙️ การตั้งค่าระบบ:
 * จัดการผ่านเมนูไอคอน "ฟันเฟือง" (Project Settings) -> "Script Properties" (สมบัติของสคริปต์) เท่านั้น
 */
