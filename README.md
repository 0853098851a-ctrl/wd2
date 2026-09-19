# เว็บแสดงของในเกม Roblox (เวอร์ชัน Vercel)

โครงสร้าง
- public/index.html  = หน้าเว็บ
- api/inventory.js   = ตัวรับข้อมูลจาก Roblox และส่งให้หน้าเว็บ (เก็บข้อมูลใน Upstash Redis)

## วิธีอัปเดตโปรเจกต์ที่ขึ้น Vercel ไปแล้ว
1. ใน GitHub repository เดิม ลบไฟล์ server.js และ package-lock.json ทิ้ง
2. อัปโหลดไฟล์จากโฟลเดอร์นี้ทับ (package.json, vercel.json, โฟลเดอร์ api และ public)
3. บน Vercel เปิดโปรเจกต์ > แท็บ Storage > Create Database > เลือก Upstash (Redis)
   > สร้างแล้วกด Connect กับโปรเจกต์นี้ (Vercel จะเพิ่มตัวแปรเชื่อมต่อให้เอง)
4. Settings > Environment Variables เพิ่ม API_KEY = รหัสลับยาวๆ ที่คุณตั้งเอง
5. Settings > General > Framework Preset เลือก Other แล้วไปแท็บ Deployments กด Redeploy
6. เปิดลิงก์เว็บ ควรเห็นหน้า "ของในเกมตอนนี้" (ตอนยังไม่มีผู้เล่นจะขึ้นว่ายังไม่มีผู้เล่นในเกม)

## ต่อกับ Roblox
ในสคริปต์ ServerScriptService
- WEBSITE_URL = https://ลิงก์ของคุณ.vercel.app/api/inventory
- API_KEY = ค่าเดียวกับที่ใส่ใน Vercel
แล้วเปิด Game Settings > Security > Allow HTTP Requests

## ทดสอบว่า API ทำงาน
เปิด https://ลิงก์ของคุณ.vercel.app/api/inventory ในเบราว์เซอร์
ถ้าขึ้น [] แปลว่าเชื่อมฐานข้อมูลสำเร็จ (แค่ยังไม่มีผู้เล่น)
ถ้าขึ้น error เรื่องฐานข้อมูล ให้ทำข้อ 3 ใหม่
