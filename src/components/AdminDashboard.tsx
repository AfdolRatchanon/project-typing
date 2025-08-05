// src/components/AdminDashboard.tsx

import React from 'react';
import { Settings, Users, BarChart, Gamepad2 } from 'lucide-react';

// ตรวจสอบให้แน่ใจว่า interface นี้ถูกต้องและไม่มีการนำ AuthSectionProps มาใช้ผิดที่
interface AdminDashboardProps {
    user: any; // Firebase User object
    userRole: string | null;
    setShowAdminDashboard: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * @component AdminDashboard
 * @description Displays the dashboard interface for admin users.
 * @param {AdminDashboardProps} props - Props for AdminDashboard component.
 */
const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, userRole, setShowAdminDashboard }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-inter">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 lg:p-10 text-center max-w-2xl w-full relative">
                {/* ปุ่มสำหรับกลับไปหน้าเกม */}
                <button
                    onClick={() => setShowAdminDashboard(false)}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm"
                >
                    <Gamepad2 size={16} /> กลับไปหน้าเกม
                </button>

                <div className="flex items-center justify-center mb-6">
                    <Settings size={48} className="text-blue-600 mr-4" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Admin Dashboard
                    </h1>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                    ยินดีต้อนรับ, <span className="font-semibold text-blue-700">{user?.displayName || 'ผู้ดูแลระบบ'}</span>!
                </p>
                <p className="text-md text-gray-600 mb-8">
                    คุณเข้าสู่ระบบในฐานะ <span className="font-bold text-purple-700">{userRole}</span>.
                    หน้านี้สำหรับจัดการระบบ
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg shadow-md border border-blue-200 flex items-center justify-center flex-col">
                        <Users size={32} className="text-blue-500 mb-3" />
                        <h3 className="text-lg font-semibold text-blue-800">การจัดการผู้ใช้</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            จัดการบัญชีผู้ใช้, บทบาท, และความคืบหน้า
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg shadow-md border border-purple-200 flex items-center justify-center flex-col">
                        <BarChart size={32} className="text-purple-500 mb-3" />
                        <h3 className="text-lg font-semibold text-purple-800">รายงานและสถิติ</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            ดูข้อมูลสถิติการใช้งานและประสิทธิภาพของระบบ
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mt-8">
                    คุณสามารถเพิ่มส่วนการจัดการต่างๆ ได้ที่นี่
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
