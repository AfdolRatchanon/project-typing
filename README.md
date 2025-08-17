# โปรแกรมฝึกพิมพ์ดีด
พัฒนาเองใช้เองเพื่อให้ยืดหยุนในการใช้งานสามารถกำหนดเนื้อหรือเกณฑ์การให้คะแนนได้เอง
### การนำไปใช้งาน
1. สร้างโปรเจ็คที่ firebase และใช้ Service ดังนี้
   1. Hosting
   2. RealtimeDB มีการกำหนด Rules ดังนี้
```
{
  "rules": {
    "artifacts": {
      "$appId": {
        "users": {
          // Rule นี้อนุญาตให้ผู้ดูแลระบบ (Admin) สามารถอ่านข้อมูลของผู้ใช้ทั้งหมดได้
          ".read": "auth != null && root.child('artifacts').child($appId).child('users').child(auth.uid).child('profile/role').val() == 'admin'",
          
          "$userId": {
            // Rule นี้อนุญาตให้ผู้ใช้แต่ละคนสามารถอ่านข้อมูลของตัวเองได้
            ".read": "auth != null && auth.uid == $userId",
            
            // Rule นี้อนุญาตให้ผู้ใช้สามารถเขียนข้อมูลได้เฉพาะในส่วนของตัวเองเท่านั้น
            ".write": "auth != null && auth.uid == $userId"
          }
        },
        "public": {
          "data": {
            ".read": true,
            ".write": "auth != null"
          }
        }
      }
    }
  }
}          
```
   3. Authentication ใช้ provider เป็น Google 
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
npm run build
```
2. นำไฟล์ dist ไป Deploy ขึ้น Server
### การแก้ไขเนื้อหาโปรแกรมพิมพ์ดีด
ไปที่ไฟล์ data.ts และสร้างบทเรียนที่ต้องการ รวมถึงเกฑณ์การให้คะแนน ถ้าไม่ใส่เกณฑ์การให้คะแนนจะมีค่าเริ่มต้นอยู่แล้ว
