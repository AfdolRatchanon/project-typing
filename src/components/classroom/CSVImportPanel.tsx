// src/components/classroom/CSVImportPanel.tsx

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { csvRowToMember } from '../../utils/classroomUtils';

interface Props {
    classroomId: string;
    onImport: (classroomId: string, members: { displayName: string; email: string; studentNumber?: number }[]) => Promise<void>;
}

interface ParsedRow { displayName: string; email: string; studentNumber?: number; valid: boolean; reason?: string }

const CSVImportPanel: React.FC<Props> = ({ classroomId, onImport }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState('');
    const [importing, setImporting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setDone(false);
        setError('');

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(ev.target?.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, string>[];
                const parsed: ParsedRow[] = raw.map(row => {
                    const m = csvRowToMember(row);
                    if (!m) return { displayName: '', email: '', valid: false, reason: 'ไม่พบ column ชื่อ/email' };
                    return { ...m, valid: true };
                });
                parsed.sort((a, b) => (a.studentNumber ?? 9999) - (b.studentNumber ?? 9999));
                setRows(parsed);
            } catch {
                setError('ไม่สามารถอ่านไฟล์ได้ กรุณาใช้ไฟล์ .csv หรือ .xlsx');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const validRows = rows.filter(r => r.valid);

    const handleImport = async () => {
        if (!validRows.length) return;
        setImporting(true);
        setError('');
        try {
            await onImport(classroomId, validRows.map(r => ({
                displayName: r.displayName,
                email: r.email,
                ...(r.studentNumber !== undefined ? { studentNumber: r.studentNumber } : {}),
            })));
            setDone(true);
            setRows([]);
            setFileName('');
        } catch {
            setError('นำเข้าไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="rounded-xl p-4" style={{ border: '1px dashed var(--color-border)' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--color-accent)' }} /> นำเข้ารายชื่อจาก CSV / Excel
            </h3>

            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                ไฟล์ต้องมี column: <strong>ชื่อ</strong> (หรือ name), <strong>email</strong> (หรือ อีเมล) และ <strong>เลขที่</strong> (หรือ no — ไม่บังคับ)
            </p>

            <div className="flex items-center gap-2 mb-3">
                <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-sidebar)' }}>
                    <Upload size={14} /> เลือกไฟล์
                </button>
                {fileName && <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{fileName}</span>}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />

            {/* Preview */}
            {rows.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                        พบ {rows.length} แถว — ถูกต้อง {validRows.length} แถว
                    </p>
                    <div className="overflow-y-auto rounded-lg max-h-48" style={{ border: '1px solid var(--color-border)' }}>
                        <table className="min-w-full text-xs">
                            <thead>
                                <tr style={{ background: 'var(--color-primary-light)' }}>
                                    <th className="py-2 px-3 text-center" style={{ color: 'var(--color-text)' }}>เลขที่</th>
                                    <th className="py-2 px-3 text-left" style={{ color: 'var(--color-text)' }}>ชื่อ</th>
                                    <th className="py-2 px-3 text-left" style={{ color: 'var(--color-text)' }}>อีเมล</th>
                                    <th className="py-2 px-3 text-center" style={{ color: 'var(--color-text)' }}>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                                        <td className="py-1.5 px-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.studentNumber ?? '—'}</td>
                                        <td className="py-1.5 px-3" style={{ color: 'var(--color-text)' }}>{r.displayName || '—'}</td>
                                        <td className="py-1.5 px-3" style={{ color: 'var(--color-text-muted)' }}>{r.email || '—'}</td>
                                        <td className="py-1.5 px-3 text-center">
                                            {r.valid
                                                ? <CheckCircle size={13} style={{ color: 'var(--color-success)', display: 'inline' }} />
                                                : <span className="flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--color-error)' }}>
                                                    <X size={12} /> {r.reason}
                                                  </span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleImport} disabled={importing || validRows.length === 0}
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'var(--color-primary)' }}>
                        <Upload size={14} />
                        {importing ? 'กำลังนำเข้า...' : `นำเข้า ${validRows.length} รายชื่อ`}
                    </button>
                </div>
            )}

            {error && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-error)' }}><AlertCircle size={12} />{error}</p>}
            {done && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-success)' }}><CheckCircle size={12} /> นำเข้าสำเร็จ</p>}
        </div>
    );
};

export default CSVImportPanel;
