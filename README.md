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

## 🛠️ Deployment Steps

### 1. Register System Secrets
1. Navigate to your [Google Apps Script Editor](https://script.google.com/).
2. Copy the consolidated files into your workspace.
3. Open `src/Secret.gs` and fill in your private GCP, Firebase, Streamlabs and Xendit credentials.
4. Run the function `initializeSystemSecrets`.
5. **[Mandatory]** Delete `src/Secret.gs` permanently from the project after execution.

### 2. Configure the 30-Day Data Purge Trigger
1. In the Apps Script sidebar, click the **Triggers** icon (Clock).
2. Click **Add Trigger** and set:
   * **Choose function:** `cleanupExpiredDonations`
   * **Event source:** `Time-driven`
   * **Type of time-based trigger:** `Day timer`
   * **Select hour:** Choose low-traffic hours (e.g., `Midnight to 1 AM`)
3. Save the trigger.

### 3. Deploy the Web App
1. Click **Deploy** -> **New Deployment**.
2. Select **Web App**.
3. Set **Execute as:** `Me` (Your account).
4. Set **Who has access:** `Anyone` (Public).
5. Deploy and copy the Web App URL (Configure this URL inside your Xendit Dashboard Webhooks).


# เกตเวย์รับยอดเงินสนับสนุน VTuber ปลอดภัยสูง (รุ่นสอดคล้องตามนโยบาย PDPA)

โครงสร้างระบบเชื่อมต่อและแปลงรหัสยอดบริจาคเข้าสู่การแจ้งเตือนสตรีมเมอร์ ทำงานบนสถาปัตยกรรมไร้เซิร์ฟเวอร์ (Serverless) และไม่มีการเก็บข้อมูลอ่อนไหวถาวรบนระบบ (Stateless) พัฒนาขึ้นด้วยบริการคลาวด์ขนาดเล็กของ Google Apps Script (GAS) เพื่อส่งต่อลายเซ็นยอดจ่ายเงิน PromptPay แบบไม่ผ่านผู้รับภายนอก พร้อมมาตรฐานความสอดคล้องต่อนโยบายคุ้มครองข้อมูลส่วนบุคคลของไทย (PDPA) อย่างสมบูรณ์

---

## 🚀 จุดเด่นทางระบบความปลอดภัยและฟีเจอร์เด่น
1. **สอดคล้องกฎหมาย PDPA/GDPR:** ไม่เก็บข้อมูลชื่อบัญชีจริงหรือเลขบัญชีธนาคาร แสดงผลเฉพาะชื่อเล่นที่ผู้ใช้กรอกเข้ามาเท่านั้น
2. **ระบบสับคัตเอาต์เยียวยาตัวเองอัตโนมัติ (Circuit Breaker):** หลีกเลี่ยงหน้าสตรีมค้างหรือล่ม โดยระบบจะตัดสัญญาณฝั่งหน้าจอเตือน Streamlabs อัตโนมัติหากพบสัญญาณติดขัด แต่กระบวนการชำระเงินยังทำงานปกติ
3. **ระบบสกัดบ็อตก่อกวน (Anti-Automation Throttling):** กลไกบังคับฝั่งหน้าเว็บให้คำนวณถอดโจทย์พรูฟออฟเวิร์ก (Proof-of-Work) ร่วมกับมาตรการบล็อกยอดคำขอพุ่งกระฉูดระดับ Global Spike
4. **นโยบายความมั่นคงปลอดภัยสคริปต์ (Strict Nonce CSP):** ป้องกันช่องทางลักลอบโจมตีหรือเปลี่ยนโครงสร้างโค้ดหน้าเว็บบนเบราว์เซอร์ด้วยสัญชาตลักษณ์ป้องกันสคริปต์แอบแฝง
5. **ระบบทุบทำลายประวัติธุรกรรมประจำวัน (30-Day Data Purging):** ติดตั้งระบบทำงานนัดแนะตรวจสอบประวัติในฐานข้อมูล Firebase ทุก 24 ชั่วโมงเพื่อลบข้อมูลที่อายุเกิน 30 วันทิ้งตามกฎหมายกำหนด

---

## 🛠️ ขั้นตอนการติดตั้งใช้งานระบบ (Deployment Steps)

### 1. ทำการลงทะเบียนคีย์ความปลอดภัยของระบบ
1. เข้าไปที่หน้าเว็บควบคุมโครงการ [Google Apps Script Editor](https://script.google.com/) ของคุณค่ะ
2. ทำการคัดลอกไฟล์ต้นฉบับทั้งหมดจากคลังนี้ไปใส่ในหน้าต่างตัวเขียนโปรแกรมของคุณ
3. เปิดไฟล์ชื่อ `src/Secret.gs` และทำการใส่ค่ารหัสคีย์ และพารามิเตอร์การเชื่อมต่อไปยังผู้ให้บริการ Firebase, Xendit และ Streamlabs ของคุณให้เรียบร้อย
4. กดเลือกชื่อฟังก์ชัน `initializeSystemSecrets` จากแถบเมนูด้านบน แล้วกดปุ่มรันการทำงาน (Run)
5. **[สำคัญมากและห้ามข้ามขั้นตอนเด็ดขาด]** เมื่อรันฟังก์ชันเสร็จสิ้นเรียบร้อยแล้ว ให้ทำการกดลบไฟล์ `src/Secret.gs` ออกจากตัวโครงการใน Apps Script ทันทีค่ะเพื่อเลี่ยงความลับของระบบรั่วไหล

### 2. ตั้งค่าบ็อตลบทำลายข้อมูลอัตโนมัติประจำวัน (PDPA Purge Cron Trigger)
1. ในแถบเมนูด้านข้างซ้ายของหน้า Apps Script ให้คลิกที่ไอคอนรูปนาฬิกา เพื่อเข้าสู่หน้าจอตั้งเวลาตัวกระตุ้น (Triggers)
2. คลิกปุ่ม **เพิ่มตัวกระตุ้น (Add Trigger)** ที่ปุ่มมุมขวาล่าง และระบุค่าคุณสมบัติต่อไปนี้:
   * **ฟังก์ชันที่จะทำงาน (Choose function):** `cleanupExpiredDonations`
   * **แหล่งเหตุการณ์ (Event source):** `แบบอ้างอิงเวลา (Time-driven)`
   * **ประเภทตัวกระตุ้นเวลา (Type of time-based trigger):** `ตัวจับเวลาแบบรายวัน (Day timer)`
   * **เลือกช่วงเวลา (Select hour):** แนะนำให้เลือกช่วงเวลาที่ระบบมีปริมาณการทำรายการน้อยที่สุด (เช่น `ช่วงเวลาระหว่าง เที่ยงคืน ถึง ตี 1`)
3. กดปุ่มบันทึก (Save) ตัวกำหนดเวลา

### 3. เปิดบริการและนำโปรแกรมใช้งานในฐานะเว็บแอป (Deploy Web App)
1. กดที่ปุ่ม **การทำให้ใช้งานได้ (Deploy)** และเลือก **การทำให้ใช้งานได้ใหม่ (New Deployment)** จากมุมขวาบนของหน้าจอแก้ไข
2. เลือกรูปแบบประเภทการเชื่อมต่อเป็นแบบ **เว็บแอป (Web App)**
3. ตั้งค่าที่หัวข้อ **เรียกใช้งานในฐานะ (Execute as):** เลือกเป็น `ฉัน (อีเมลสตรีมเมอร์/แอดมินของคุณเอง)`
4. ตั้งค่าที่หัวข้อ **ผู้มีสิทธิ์เข้าใช้งาน (Who has access):** เลือกเป็น `ทุกคน (Anyone)` (เพื่อให้คนทั่วไปเข้ามากดใช้และส่งเว็บบุกได้)
5. กดปุ่มการทำให้ใช้งานได้ และคัดลอกลิงก์ที่แสดงอยู่หลังคำว่า "เว็บแอป URL" นำไปกรอกลงในส่วนของ Webhook URL ในหน้าการตั้งค่า Callback ของ Xendit Dashboard ของคุณค่ะ
