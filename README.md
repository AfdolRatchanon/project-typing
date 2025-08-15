# โปรแกรมฝึกพิมพ์ดีด
พัฒนาเองใช้เองเพื่อให้ยืดหยุนในการใช้งานสามารถกำหนดเนื้อหรือเกณฑ์การให้คะแนนได้เอง
### การนำไปใช้งาน
1. สร้างโปรเจ็คที่ firebase และใช้ Service ดังนี้
   1. Hosting
   2. RealtimeDB
   3. Authentication 
2. ดาวน์โหลด Source code และใช้คำสั่ง
```
npm install
```
3. ตั้งค่าในไฟล์ firebaseConfig.ts ผ่านยังตัวแปร `firebaseConfig` โดยเน้นในส่วน 4 ส่วนนี้
```
  apiKey: "YOUR_API_KEY",,
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "YOUR_DATABASE_URL",
```
4. รันโปรแกรมด้วยคำสั่ง
```
npm run dev
```
### หาจะ Deploy ขึ้น Server ให้ใช้คำสั่งดังนี้
1. bulid โปรเจ็ค ด้วยคำสั่ง
```
npum run build
```
2. นำไฟล์ dist ไป Deploy ขึ้น Server
### การแก้ไขเนื้อหาโปรแกรมพิมพ์ดีด
ไปที่ไฟล์ data.ts และสร้างบทเรียนที่ต้องการ รวมถึงเกฑณ์การให้คะแนน ถ้าไม่ใส่เกณฑ์การให้คะแนนจะมีค่าเริ่มต้นอยู่แล้ว
