/**
 * Playwright Global Setup
 * รันครั้งเดียวก่อน test suite ทั้งหมด
 * - สร้าง test users ใน Auth Emulator
 * - เขียน user profiles ลง Firestore Emulator
 */

import { createEmulatorUser, writeFirestoreDoc } from './helpers/emulator';

const NOW = Date.now();

interface UserProfile {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin' | 'superAdmin';
}

async function createUserWithProfile(profile: UserProfile): Promise<string> {
  const uid = await createEmulatorUser(profile.email, profile.password, profile.displayName);
  await writeFirestoreDoc(`users/${uid}`, {
    uid,
    email: profile.email,
    displayName: profile.displayName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    photoURL: null,
    classroomIds: [],
    isProfileComplete: true,
    createdAt: NOW,
  });
  console.log(`  ✓ ${profile.role.padEnd(12)} ${profile.email} (uid: ${uid.slice(0, 8)}...)`);
  return uid;
}

export default async function globalSetup() {
  console.log('\n[Playwright GlobalSetup] สร้าง test users...\n');

  await createUserWithProfile({
    email: 'teacher1@test.com', password: 'test1234',
    displayName: 'ครูทดสอบ 1', firstName: 'ทดสอบ', lastName: 'หนึ่ง',
    role: 'teacher',
  });

  await createUserWithProfile({
    email: 'teacher2@test.com', password: 'test1234',
    displayName: 'ครูทดสอบ 2', firstName: 'ทดสอบ', lastName: 'สอง',
    role: 'teacher',
  });

  for (let i = 1; i <= 10; i++) {
    const num = String(i).padStart(2, '0');
    await createUserWithProfile({
      email: `student${num}@test.com`, password: 'test1234',
      displayName: `นักเรียน ${num}`, firstName: 'นักเรียน', lastName: num,
      role: 'student',
    });
  }

  await createUserWithProfile({
    email: 'admin@test.com', password: 'test1234',
    displayName: 'Admin ทดสอบ', firstName: 'Admin', lastName: 'Test',
    role: 'admin',
  });

  await createUserWithProfile({
    email: 'superadmin@test.com', password: 'test1234',
    displayName: 'SuperAdmin', firstName: 'Super', lastName: 'Admin',
    role: 'superAdmin',
  });

  console.log('\n[Playwright GlobalSetup] เสร็จแล้ว ✓\n');
}
