import ExcelJS from 'exceljs';
import { format } from 'date-fns';

interface AttendanceRecord {
  date: string;
  morning_in: string | null;
  morning_out: string | null;
  afternoon_in: string | null;
  afternoon_out: string | null;
  session_attendance_status: string;
  manual_entry: boolean;
  manual_marked_by_name?: string | null;
}

interface Beneficiary {
  teacher_id: string;
  name: string;
  name_english?: string | null;
  phone?: string | null;
  sex?: string | null;
  province_name?: string | null;
  district_name?: string | null;
  school?: string | null;
  position?: string | null;
}

interface AttendanceExportData {
  training: {
    training_code: string;
    training_name: string;
    training_name_english?: string | null;
    training_type?: string | null;
    training_category?: string | null;
    training_level?: string | null;
    training_location: string;
    training_start_date: string;
    training_end_date: string;
    max_participants: number;
    current_participants: number;
  };
  attendanceRecords: {
    beneficiary: Beneficiary;
    attendance: AttendanceRecord[];
  }[];
}

export async function exportAttendanceData(data: any) {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'Training Management System';
  workbook.created = new Date();

  // Extract training info from the response
  // The API might return the data in a different structure than expected
  const trainingInfo = data.training || data;

  // Create Training Info Sheet
  const infoSheet = workbook.addWorksheet('Training Information', {
    properties: { defaultRowHeight: 20 },
  });

  // Training Info Header
  infoSheet.mergeCells('A1:D1');
  const titleCell = infoSheet.getCell('A1');
  titleCell.value = 'TRAINING INFORMATION / ព័ត៌មានការបណ្តុះបណ្តាល';
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2D9596' },
  };

  // Training Details
  infoSheet.getColumn(1).width = 25;
  infoSheet.getColumn(2).width = 40;

  const trainingDetails = [
    ['Training Code / កូដការបណ្តុះបណ្តាល:', trainingInfo.training_code || 'N/A'],
    ['Training Name (EN):', trainingInfo.training_name_english || trainingInfo.training_name || 'N/A'],
    ['Training Name (KM):', trainingInfo.training_name || 'N/A'],
    ['Type / ប្រភេទ:', trainingInfo.training_type || 'N/A'],
    ['Category / ប្រភេទ:', trainingInfo.training_category || 'N/A'],
    ['Level / កម្រិត:', trainingInfo.training_level || 'N/A'],
    ['Location / ទីតាំង:', trainingInfo.training_location || 'N/A'],
    ['Start Date / ថ្ងៃចាប់ផ្តើម:', trainingInfo.training_start_date ? format(new Date(trainingInfo.training_start_date), 'dd MMM yyyy') : 'N/A'],
    ['End Date / ថ្ងៃបញ្ចប់:', trainingInfo.training_end_date ? format(new Date(trainingInfo.training_end_date), 'dd MMM yyyy') : 'N/A'],
    ['Participants / អ្នកចូលរួម:', `${trainingInfo.current_participants || 0} / ${trainingInfo.max_participants || 0}`],
  ];

  let row = 3;
  trainingDetails.forEach(([label, value]) => {
    const labelCell = infoSheet.getCell(`A${row}`);
    labelCell.value = label;
    labelCell.font = { bold: true };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4F5' },
    };

    const valueCell = infoSheet.getCell(`B${row}`);
    valueCell.value = value;

    row++;
  });

  // Create Attendance Details Sheet
  const attendanceSheet = workbook.addWorksheet('Attendance Details', {
    properties: { defaultRowHeight: 20 },
  });

  // Get attendance records - handle different possible structures
  const attendanceRecords = data.attendanceRecords || data.attendance || data;

  // Get all unique dates from attendance records
  const allDates = new Set<string>();
  if (Array.isArray(attendanceRecords)) {
    attendanceRecords.forEach(record => {
      if (record.attendance && Array.isArray(record.attendance)) {
        record.attendance.forEach(attendance => {
          allDates.add(attendance.date);
        });
      } else if (record.date) {
        allDates.add(record.date);
      }
    });
  }
  const sortedDates = Array.from(allDates).sort();

  // Header
  attendanceSheet.mergeCells(`A1:${String.fromCharCode(67 + sortedDates.length * 4)}1`);
  const attendanceTitleCell = attendanceSheet.getCell('A1');
  attendanceTitleCell.value = 'ATTENDANCE DETAILS / សេចក្តីលម្អិតវត្តមាន';
  attendanceTitleCell.font = { bold: true, size: 16 };
  attendanceTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  attendanceTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2D9596' },
  };

  // Attendance Headers - Row 3 (Date headers)
  const dateHeaderRow = attendanceSheet.getRow(3);
  dateHeaderRow.values = ['No.', 'Teacher ID', 'Name'];

  let colIndex = 4;
  sortedDates.forEach(date => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy');
    attendanceSheet.mergeCells(3, colIndex, 3, colIndex + 3);
    const dateCell = attendanceSheet.getCell(3, colIndex);
    dateCell.value = formattedDate;
    dateCell.font = { bold: true };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEAA7' },
    };
    colIndex += 4;
  });

  // Attendance Sub-Headers - Row 4 (Session headers)
  const sessionHeaderRow = attendanceSheet.getRow(4);
  sessionHeaderRow.values = ['', '', ''];

  colIndex = 4;
  sortedDates.forEach(() => {
    sessionHeaderRow.getCell(colIndex).value = 'Morning In\nពេលព្រឹក ចូល';
    sessionHeaderRow.getCell(colIndex + 1).value = 'Morning Out\nពេលព្រឹក ចេញ';
    sessionHeaderRow.getCell(colIndex + 2).value = 'Afternoon In\nរសៀល ចូល';
    sessionHeaderRow.getCell(colIndex + 3).value = 'Afternoon Out\nរសៀល ចេញ';
    colIndex += 4;
  });

  sessionHeaderRow.font = { bold: true, size: 9 };
  sessionHeaderRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sessionHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4E6F1' },
  };
  sessionHeaderRow.height = 35;

  // Set column widths for attendance sheet
  attendanceSheet.getColumn(1).width = 6;
  attendanceSheet.getColumn(2).width = 18;
  attendanceSheet.getColumn(3).width = 25;

  for (let i = 4; i < 4 + sortedDates.length * 4; i++) {
    attendanceSheet.getColumn(i).width = 10;
  }

  // Add attendance data
  if (Array.isArray(attendanceRecords)) {
    attendanceRecords.forEach((record, index) => {
      const rowNum = index + 5;
      const row = attendanceSheet.getRow(rowNum);

      // Handle different possible data structures
      const beneficiary = record.beneficiary || record;
      row.getCell(1).value = index + 1;
      row.getCell(2).value = beneficiary.teacher_id || record.beneficiary_id || 'N/A';
      row.getCell(3).value = beneficiary.name || 'N/A';

      // Create a map of attendance records by date
      const attendanceMap = new Map<string, any>();
      if (record.attendance && Array.isArray(record.attendance)) {
        record.attendance.forEach(attendance => {
          attendanceMap.set(attendance.date, attendance);
        });
      } else if (record.date) {
        // If the record itself contains attendance data for a single date
        attendanceMap.set(record.date, record);
      }

      colIndex = 4;
      sortedDates.forEach(date => {
        const attendance = attendanceMap.get(date);

        if (attendance) {
          // Morning In
          row.getCell(colIndex).value = attendance.morning_in ? format(new Date(attendance.morning_in), 'HH:mm') : '-';
          // Morning Out
          row.getCell(colIndex + 1).value = attendance.morning_out ? format(new Date(attendance.morning_out), 'HH:mm') : '-';
          // Afternoon In
          row.getCell(colIndex + 2).value = attendance.afternoon_in ? format(new Date(attendance.afternoon_in), 'HH:mm') : '-';
          // Afternoon Out
          row.getCell(colIndex + 3).value = attendance.afternoon_out ? format(new Date(attendance.afternoon_out), 'HH:mm') : '-';

          // Color code based on status
          const statusColors: Record<string, string> = {
            PRESENT: 'FF90EE90',
            ABSENT: 'FFFFA07A',
            LATE: 'FFFFD700',
            EXCUSED: 'FFADD8E6',
          };

          const color = statusColors[attendance.session_attendance_status] || 'FFFFFFFF';
          for (let i = 0; i < 4; i++) {
            row.getCell(colIndex + i).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: color },
            };
          }
        } else {
          // No record
          row.getCell(colIndex).value = '-';
          row.getCell(colIndex + 1).value = '-';
          row.getCell(colIndex + 2).value = '-';
          row.getCell(colIndex + 3).value = '-';
        }

        colIndex += 4;
      });

      row.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  }

  // Add borders to all sheets
  [infoSheet, attendanceSheet].forEach(sheet => {
    sheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  });

  // Generate filename
  const filename = `${trainingInfo.training_code || 'attendance'}_Attendance_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}