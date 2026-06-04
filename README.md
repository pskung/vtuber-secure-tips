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

# 📖 คู่มือการติดตั้ง ใช้งาน และตกแต่งระบบ VTuber Secure Tips

---

## 1. สิ่งที่คุณต้องเตรียมก่อนเริ่มต้น (Prerequisites)

เพื่อการติดตั้งที่ราบรื่น กรุณาสมัครใช้งานและเปิดแท็บหน้าเว็บเหล่านี้เตรียมไว้ล่วงหน้าได้เลย (ทุกระบบมีบริการแบบฟรีให้ใช้งานทั้งหมด):

1. **บัญชี Google Account (Gmail):** สำหรับใช้สร้าง Google Sheets และระบบ Google Apps Script หลังบ้าน
2. **บัญชี Firebase Console:** สำหรับทำหน้าที่เป็นฐานข้อมูลเก็บประวัติธุรกรรมแบบปลอดภัย 30 วัน
   * 👉 สมัครใช้งานฟรีได้ที่: [https://console.firebase.google.com/](https://console.firebase.google.com/)
3. **บัญชี Xendit (Payment Gateway):** สำหรับสร้างและประมวลผลยอดสแกน PromptPay แบบอัตโนมัติ
   * 👉 สมัครใช้งานฟรีได้ที่: [https://dashboard.xendit.co/](https://dashboard.xendit.co/)
4. **บัญชี Streamlabs (ตัวแจ้งเตือนสตรีม):** สำหรับส่งภาพและเสียงแจ้งเตือนขึ้นหน้าจอเวลาไลฟ์สด (หากไม่ใช้ สามารถข้ามได้)
   * 👉 หน้าการตั้งค่า API: [https://streamlabs.com/dashboard#/settings/api-settings](https://streamlabs.com/dashboard#/settings/api-settings)

---

## 2. ขั้นตอนการติดตั้งอย่างละเอียด (Step-by-Step Installation)

---

### ขั้นตอนที่ 2.1: การสร้างและวางโค้ดใน Google Sheets
สามารถ copy sheet นี้ https://docs.google.com/spreadsheets/d/1VkZsCaL6c5HldQrHj8ESVkM5VwLxRWifzLP5KQJL1Sk/copy เพื่อทำสำเนา code ไปใช้งานได้เลย

#### 1. ทำสำเนาระบบเข้าสู่สเปรดชีตส่วนตัว
* คลิกเปิดลิงก์ตัวช่วยติดตั้งระบบที่คุณได้รับ (ลิงก์ที่ลงท้ายด้วย `/copy`)
* หน้าจอของ Google จะแสดงกล่องข้อความถามยืนยัน ให้คลิกปุ่ม **"ทำสำเนา (Make a copy)"**
* ระบบจะทำการสร้างชีตใหม่พร้อมจำลองโค้ดรักษาความปลอดภัยและหน้าจอดีไซน์ทั้งหมดมาเก็บไว้ในไดรฟ์ส่วนตัวของคุณให้โดยอัตโนมัติ

#### 2. สมัครใช้คลังข้อมูลเก็บประวัติความปลอดภัย Firebase
* เปิดเบราว์เซอร์ไปที่ [Firebase Console](https://console.firebase.google.com/) แล้วล็อกอินด้วยบัญชี Google ของคุณ
* คลิกปุ่ม **Add project (เพิ่มโครงการ)** -> ตั้งชื่อโครงการของคุณ เช่น `my-secure-donation` -> กดถัดไปและเปิดสิทธิ์จนเสร็จเรียบร้อย (แนะนำให้กดปิดตัวระบบ Google Analytics เพื่อให้ติดตั้งเสร็จไวขึ้น)
* ที่เมนูด้านซ้าย เลือก **Build (สร้าง)** -> **Realtime Database** -> คลิก **Create Database (สร้างฐานข้อมูล)**
* ให้ระบุเลือกประเทศเซิร์ฟเวอร์เป็น **Singapore (asia-southeast1)** และคลิกเลือกโหมดความปลอดภัย **Locked mode (โหมดล็อก)** แล้วกดเปิดใช้งาน
* สลับไปที่แท็บ **Rules (กฎ)** ด้านบน -> คัดลอกโค้ดตรวจสอบสิทธิ์จากกล่องด้านล่างนี้ไปวางทับค่าเดิมทั้งหมด แล้วกดปุ่ม **Publish (เผยแพร่)**:
  ```json
  {
    "rules": {
      "donations": {
        ".indexOn": ["created_at"],
        "$donation_id": {
          ".read": "auth != null",
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['id', 'nickname', 'amount', 'status', 'created_at']) && newData.child('amount').isNumber() && newData.child('amount').val() >= 1"
        }
      }
    }
  }
  ```
* กดกลับมาที่แท็บ **Data (ข้อมูล)** แล้วทำการคัดลอกลิงก์ที่ขึ้นต้นด้วย `https://` บนหน้าจอกล่องข้อมูลเก็บไว้
* **วิธีดึงรหัส Database Secret:** คลิกสัญลักษณ์รูปฟันเฟือง ⚙️ ด้านซ้ายข้างเมนู Project Overview -> เลือก **Project settings (การตั้งค่าโครงการ)** -> คลิกแท็บ **Service accounts (บัญชีบริการ)** ด้านบน -> คลิกหัวข้อ **Database secrets (รหัสลับฐานข้อมูล)** -> กดแสดงสิทธิ์รหัสลับของโครงการของคุณแล้วกดปุ่มคัดลอกเก็บไว้

#### 3. สมัครใช้บริการแปลงธุรกรรม PromptPay ผ่าน Xendit
* สมัครและล็อกอินที่หน้า [Xendit Dashboard](https://dashboard.xendit.co/) (เปิดโหมด Test Mode ไว้ก่อนเพื่อใช้จำลองสแกนเงินสมมติ)
* ไปที่เมนู **Settings (การตั้งค่า)** -> หัวข้อย่อยด้านล่างชื่อ **API Keys** -> กดสร้างรหัสโดยเลือกตั้งค่าหัวข้อ **Money-in Products** ให้เป็นแบบ **Write (เขียน)** และหัวข้ออื่นเป็น None ทั้งหมด
* ยืนยันระบบแล้วคัดลอกตัวรหัส API Key ที่ขึ้นต้นด้วยข้อความ `xnd_live_...` หรือ `xnd_test_...` เก็บไว้
* ไปที่เมนู **Settings** อีกครั้ง -> เลื่อนลงไปหัวข้อย่อยชื่อ **Webhooks** -> เลื่อนหน้าจอลงมาด้านล่างสุดจะพบรหัสยาว ๆ ในช่อง **Webhook Verification Token** ให้กดคัดลอกเก็บไว้

#### 4. ป้อนข้อมูลระบบและติดตั้ง Web App
* สลับกลับมาที่ชีตที่คุณทำสำเนาไว้ในขั้นตอนที่ 1 
* กดปุ่มรีเฟรชหน้าเว็บ (F5) หนึ่งครั้ง จะมีเมนูพิเศษชื่อ **"⚙️ VTuber Gateway Config"** โผล่ขึ้นมาข้าง ๆ ปุ่มความช่วยเหลือด้านบนสุด
* ให้คลิกปุ่ม **⚙️ VTuber Gateway Config** -> เลือก **🔑 Configure Keys & Secrets**
* ในการเปิดใช้ครั้งแรก ระบบความปลอดภัยของ Google จะขึ้นเตือนเรื่องการยินยอมการขอสิทธิ์เข้าถึงสเปรดชีต ให้กด **Continue** -> เลือกอีเมลของคุณ -> กดคำว่า **Advanced (ขั้นสูง)** -> กดปุ่มสีเทาด้านล่างสุด **Go to... (ปลอดภัย)** -> กดปุ่ม **Allow (อนุญาต)** เพื่อรับรองสิทธิ์ความปลอดภัย
* เมื่อยืนยันสิทธิ์เสร็จแล้ว ให้คลิกเลือกปุ่ม **Configure Keys & Secrets** อีกครั้ง แผงควบคุมสไลด์บาร์จะโผล่ขึ้นมาที่ขวามือของชีต ให้กรอกรหัสข้อมูลที่คุณเตรียมไว้ทั้งหมดลงไปในแต่ละช่องให้ถูกต้อง และกดปุ่ม **Save Configuration**
* จากนั้นไปที่หน้าเขียนโค้ดหลังบ้าน (Extensions -> Apps Script) -> กดปุ่ม **Deploy (การทำให้ใช้งานได้)** ที่มุมขวาบน -> เลือก **New Deployment** -> กดเลือกประเภทเป้าหมายรูปเฟืองเป็น **Web App (เว็บแอป)** -> เลือก Execute as: **Me** และ Who has access: **Anyone** แล้วกดปุ่ม Deploy
* คัดลอกลิงก์ยาว ๆ ที่ระบบให้มาในช่อง **Web App URL**
* นำลิงก์ Web App URL ดังกล่าว ย้อนกลับไปใส่ลงในหน้าตั้งค่าเว็บฮุกของ Xendit ([Settings -> Webhooks](https://dashboard.xendit.co/)) ในหัวข้อพฤติกรรมธุรกรรมชำระเงินชื่อ **QR code paid** แล้วกดปุ่ม Test and save เป็นอันเสร็จสิ้นพิธีติดตั้งระบบ

---

## 🎨 คู่มือปรับปรุงและตกแต่งหน้าจอแสดงผลดีไซน์ (สำหรับ VTubers & สตรีมเมอร์)

สำหรับครีเอเตอร์ที่อยากปรับแก้ข้อความ เปลี่ยนยอดปุ่มกดบริจาคด่วน หรือเสริมหน้าตาอนิเมะของตนเองลงในหน้าจอโอนเงินให้เข้ากับเอกลักษณ์ของช่อง สามารถเลื่อนไปหาจุดแก้ไขในไฟล์ HTML หน้าจอได้ ดังนี้:

### 1. วิธีปรับแต่งขอบเขต ยอดโอนเงินสมทบขั้นต่ำสุด และขั้นสูงสุด
หากต้องการเปลี่ยนเกณฑ์ยอดโอนเงินขั้นต่ำเริ่มต้นตั้งแต่ 5 บาทขึ้นไป และจำกัดไม่ให้สแปมยอดการชำระเงินในโหมดสแกนเกิน 5,000 บาท

*   **จุดที่ 1 (ตัวดักฝั่งหน้าเว็บ):** ให้เปิดไฟล์ `src/GrapesJSForm.html` แล้วค้นหาคำว่า `id="amount"` แล้วทำการแก้ไขช่วงตัวเลขที่แท็ก `min` และ `max` ดังนี้ค่ะ:
    ```html
    <!-- เดิม min="1.00" max="700000.00" แก้ไขเป็นยอดใหม่ที่เราต้องการดักหน้าจอ -->
    <input type="number" id="amount" name="amount" required min="5.00" max="5000.00" step="0.01" class="gjs-form-input" style="padding-left: 28px; padding-right: 48px;" placeholder="5.00" aria-required="true">
    ```
*   **จุดที่ 2 (ตัวป้องกันฝั่งหลังบ้าน):** เปิดไฟล์ `src/PaymentGateway.gs` แล้วค้นหารหัสที่ทำหน้าที่ปัดเป่าปริมาณเงินเกินขอบเขต:
    ```javascript
    // เดิม: isNaN(amount) || amount < 1.00 || amount > 700000.00
    // ให้เปลี่ยนช่วงเงินขั้นต่ำและเพดานความปลอดภัยให้ล้อตรงกันกับหน้าบ้านค่ะ:
    if (isNaN(amount) || amount < 5.00 || amount > 5000.00) return Utils.createValidationError("ยอดสนับสนุนที่กำหนดได้ ต้องอยู่ระหว่าง 5.00 ถึง 5,000.00 บาทค่ะ");
    ```

### 2. วิธีการเปลี่ยนค่าในปุ่มยอดเงินสนับสนุนด่วน (Presets)
คุณสามารถแก้ไขจำนวนเงินด่วนในปุ่มเพื่อให้ผู้ชมที่ต้องการส่งยอดไว ๆ กดคลิกและข้ามไปหน้าสแกน QR ได้ง่ายขึ้นค่ะ

*   **จุดแก้ไข:** เปิดไฟล์ `src/GrapesJSForm.html` ค้นหาคำว่า `class="gjs-form-presets"`
*   **ตัวอย่างการแต่งพรีเซ็ตตามใจชอบ (เช่น ยอด 10, 50, 100, 1000 บาท):**
    ให้แก้ข้อมูลในสัญชาตลักษณ์ `data-preset` และตัวอักษรไทยหน้าปุ่มให้สอดคล้องกันดังนี้ค่ะ:
    ```html
    <div class="gjs-form-presets">
      <button type="button" data-preset="10" class="gjs-form-preset-btn">฿10</button>
      <button type="button" data-preset="50" class="gjs-form-preset-btn">฿50</button>
      <button type="button" data-preset="100" class="gjs-form-preset-btn">฿100</button>
      <button type="button" data-preset="1000" class="gjs-form-preset-btn">฿1,000</button>
    </div>
    ```

### 3. วิธีเพิ่มภาพตัวละคร VTuber / สตรีมเมอร์ แนะนำตัวที่หน้ากรอกยอดบริจาค
เพิ่มมิติความน่ารัก น่าเอ็นดู เพื่อดึงดูดใจแฟนคลับผู้โอนเงิน ด้วยการใส่ภาพการ์ตูนตัวละครของคุณไว้เหนือหัวแบบฟอร์มค่ะ

*   **จุดแก้ไข:** เปิดไฟล์ `src/GrapesJSForm.html` ค้นหาคลาสชื่อ `class="gjs-form-header"`
*   **ตัวอย่างการฉีดเพิ่มรูปภาพอวาตาร์ทรงกลมดีไซน์น่ารัก:**
    ```html
    <div class="gjs-form-header" style="text-align: center; margin-bottom: 12px;">
      <!-- ปรับแก้ไข URL ในช่อง src ให้เป็นลิงก์ภาพตัวละครสุดน่ารักของคุณเองได้เลยค่ะ -->
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
           alt="VTuber Avatar" 
           style="width: 75px; height: 75px; border-radius: 50%; border: 3px solid #10b981; margin: 0 auto 12px auto; display: block; object-fit: cover;">
      <h2 class="gjs-form-title">VTuber Secure Tips</h2>
    </div>
    ```

---

คู่มือนี้จัดทำขึ้นมาเพื่อตัดทอนกระบวนการทำความลับรูปแบบไฟล์โค้ดให้น้อยลง ทำให้ส่งต่อโปรเจกต์ได้อย่างสมบูรณ์แบบในลิงก์เดียว หวังว่าระบบเกตเวย์ความปลอดภัยตามนโยบาย PDPA ตัวนี้จะช่วยสนับสนุนให้เส้นทางการสร้างสรรค์ผลงานสตรีมและรายได้เข้าบัญชีของคุณเป็นไปได้อย่างราบรื่น ไร้ขีดจำกัดนะคะ มีคำถามหรืออยากให้เพิ่มความสวยงามตรงไหนอีก บอกอาคาริได้ทุกเมื่อเลยค่ะ! 💖💡
