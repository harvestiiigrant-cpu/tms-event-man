import { format } from 'date-fns';

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  // Create header row
  const keys = Array.from(allKeys);
  const headerRow = keys.map((key) => headers?.[key] || key).join(',');

  // Create data rows
  const rows = data.map((item) =>
    keys.map((key) => {
      let value = item[key];

      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }

      // Handle special characters
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      // Handle dates
      if (value instanceof Date) {
        value = format(value, 'yyyy-MM-dd HH:mm:ss');
      }

      return value ?? '';
    }).join(',')
  );

  // Combine header and data
  const csv = [headerRow, ...rows].join('\n');

  // Download file
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data to Excel-compatible CSV with BOM
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';

  exportToCSV(data, filename);

  // Re-export with BOM for Excel
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  const keys = Array.from(allKeys);
  const headerRow = keys.join(',');
  const rows = data.map((item) =>
    keys.map((key) => {
      let value = item[key];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  const csv = BOM + [headerRow, ...rows].join('\n');
  downloadFile(csv, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Download file from blob
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format beneficiary data for export
 */
export function formatBeneficiariesForExport(beneficiaries: any[]) {
  return beneficiaries.map((b) => ({
    teacher_id: b.teacher_id,
    name: b.name,
    name_english: b.name_english || '',
    phone: b.phone || '',
    sex: b.sex || '',
    province: b.province_name || '',
    district: b.district_name || '',
    commune: b.commune_name || '',
    village: b.village_name || '',
    school: b.school || '',
    position: b.position || '',
    subject: b.subject || '',
    status: b.status,
    created_at: b.created_at ? format(new Date(b.created_at), 'yyyy-MM-dd') : '',
  }));
}

/**
 * Format training data for export
 */
export function formatTrainingsForExport(trainings: any[]) {
  return trainings.map((t) => ({
    training_code: t.training_code,
    training_name: t.training_name,
    training_name_english: t.training_name_english || '',
    training_type: t.training_type || '',
    training_category: t.training_category || '',
    training_level: t.training_level || '',
    training_status: t.training_status,
    training_location: t.training_location,
    start_date: t.training_start_date ? format(new Date(t.training_start_date), 'yyyy-MM-dd') : '',
    end_date: t.training_end_date ? format(new Date(t.training_end_date), 'yyyy-MM-dd') : '',
    max_participants: t.max_participants,
    current_participants: t.current_participants,
    province: t.province_name || '',
    district: t.district_name || '',
  }));
}

/**
 * Format attendance data for export
 */
export function formatAttendanceForExport(attendanceRecords: any[], trainingName: string) {
  return attendanceRecords.map((r) => ({
    beneficiary_id: r.beneficiary?.teacher_id || '',
    beneficiary_name: r.beneficiary?.name || '',
    date: r.date ? format(new Date(r.date), 'yyyy-MM-dd') : '',
    morning_in: r.morning_in ? format(new Date(r.morning_in), 'HH:mm:ss') : '',
    morning_out: r.morning_out ? format(new Date(r.morning_out), 'HH:mm:ss') : '',
    afternoon_in: r.afternoon_in ? format(new Date(r.afternoon_in), 'HH:mm:ss') : '',
    afternoon_out: r.afternoon_out ? format(new Date(r.afternoon_out), 'HH:mm:ss') : '',
    status: r.session_attendance_status,
    device: r.device || '',
  }));
}

/**
 * Format enrollment data for export
 */
export function formatEnrollmentsForExport(enrollments: any[], trainingName: string) {
  return enrollments.map((e) => ({
    beneficiary_id: e.beneficiary?.teacher_id || '',
    beneficiary_name: e.beneficiary?.name || '',
    beneficiary_phone: e.beneficiary?.phone || '',
    beneficiary_school: e.beneficiary?.school || '',
    registration_date: e.registration_date ? format(new Date(e.registration_date), 'yyyy-MM-dd') : '',
    registration_method: e.registration_method || '',
    attendance_status: e.attendance_status,
    training_role: e.training_role || '',
    certificate_issued: e.certificate_issued ? 'Yes' : 'No',
  }));
}
