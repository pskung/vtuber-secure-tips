# VTuber Secure Tips (PDPA-Compliant Model)

Highly resilient, modular, stateless backend gateway designed on Google Apps Script (GAS) Serverless context. Facilitates and triggers dynamic PromptPay QR code generation and live stream notification alerts anonymized under Thailand's PDPA rules.

---

## 🚀 Key Security Features
1. **PDPA/GDPR Compliance:** Discards real bank names and account strings. Broadcasts only display nicknames.
2. **Aggregated Self-Healing Circuit Breaker:** Dynamically drops broken alert endpoints without affecting payment records [1.1.3].
3. **Anti-Automation Throttling:** Multi-layered Proof-of-Work client check combined with dynamic global spike-rate queue limits.
4. **Strict Nonce CSP:** Zero 'unsafe-inline' elements. Secure dynamic event listeners mapped under active nonce checks.
5. **30-Day Automated Data Purge:** Automated daily time-driven cron cleanses donor history older than 30 days.

---

# VTuber Secure Tips (PDPA-Compliant Model)

โครงสร้างระบบเชื่อมต่อและแปลงรหัสยอดบริจาคเข้าสู่การแจ้งเตือนสตรีมเมอร์ ทำงานบนสถาปัตยกรรมไร้เซิร์ฟเวอร์ (Serverless) และไม่มีการเก็บข้อมูลอ่อนไหวถาวรบนระบบ (Stateless) พัฒนาขึ้นด้วยบริการคลาวด์ขนาดเล็กของ Google Apps Script (GAS) เพื่อส่งต่อลายเซ็นยอดจ่ายเงิน PromptPay แบบไม่ผ่านผู้รับภายนอก พร้อมมาตรฐานความสอดคล้องต่อนโยบายคุ้มครองข้อมูลส่วนบุคคลของไทย (PDPA) อย่างสมบูรณ์

---

## 🚀 จุดเด่นทางระบบความปลอดภัยและฟีเจอร์เด่น
1. **สอดคล้องกฎหมาย PDPA/GDPR:** ไม่เก็บข้อมูลชื่อบัญชีจริงหรือเลขบัญชีธนาคาร แสดงผลเฉพาะชื่อเล่นที่ผู้ใช้กรอกเข้ามาเท่านั้น
2. **ระบบสับคัตเอาต์เยียวยาตัวเองอัตโนมัติ (Circuit Breaker):** หลีกเลี่ยงหน้าสตรีมค้างหรือล่ม โดยระบบจะตัดสัญญาณฝั่งหน้าจอเตือน Streamlabs อัตโนมัติหากพบสัญญาณติดขัด แต่กระบวนการชำระเงินยังทำงานปกติ
3. **ระบบสกัดบ็อตก่อกวน (Anti-Automation Throttling):** กลไกบังคับฝั่งหน้าเว็บให้คำนวณถอดโจทย์พรูฟออฟเวิร์ก (Proof-of-Work) ร่วมกับมาตรการบล็อกยอดคำขอพุ่งกระฉูดระดับ Global Spike
4. **นโยบายความมั่นคงปลอดภัยสคริปต์ (Strict Nonce CSP):** ป้องกันช่องทางลักลอบโจมตีหรือเปลี่ยนโครงสร้างโค้ดหน้าเว็บบนเบราว์เซอร์ด้วยสัญชาตลักษณ์ป้องกันสคริปต์แอบแฝง
5. **ระบบทุบทำลายประวัติธุรกรรมประจำวัน (30-Day Data Purging):** ติดตั้งระบบทำงานนัดแนะตรวจสอบประวัติในฐานข้อมูล Firebase ทุก 24 ชั่วโมงเพื่อลบข้อมูลที่อายุเกิน 30 วันทิ้งตามกฎหมายกำหนด

---
