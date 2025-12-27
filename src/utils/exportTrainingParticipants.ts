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

interface Participant {
  beneficiary_id: string;
  training_role: string;
  registration_date: string;
  attendance_status: string;
  attendance_percentage?: number | null;
  beneficiary: Beneficiary;
  attendanceRecords: AttendanceRecord[];
}

interface Training {
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
}

interface ExportData {
  training: Training;
  participants: Participant[];
}

export async function exportTrainingParticipants(data: ExportData) {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'Training Management System';
  workbook.created = new Date();

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

  const trainingInfo = [
    ['Training Code / កូដការបណ្តុះបណ្តាល:', data.training.training_code],
    ['Training Name (EN):', data.training.training_name_english || data.training.training_name],
    ['Training Name (KM):', data.training.training_name],
    ['Type / ប្រភេទ:', data.training.training_type || 'N/A'],
    ['Category / ប្រភេទ:', data.training.training_category || 'N/A'],
    ['Level / កម្រិត:', data.training.training_level || 'N/A'],
    ['Location / ទីតាំង:', data.training.training_location],
    ['Start Date / ថ្ងៃចាប់ផ្តើម:', format(new Date(data.training.training_start_date), 'dd MMM yyyy')],
    ['End Date / ថ្ងៃបញ្ចប់:', format(new Date(data.training.training_end_date), 'dd MMM yyyy')],
    ['Participants / អ្នកចូលរួម:', `${data.training.current_participants} / ${data.training.max_participants}`],
  ];

  let row = 3;
  trainingInfo.forEach(([label, value]) => {
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

  // Create Participants Sheet
  const participantsSheet = workbook.addWorksheet('Participants List', {
    properties: { defaultRowHeight: 20 },
  });

  // Header
  participantsSheet.mergeCells('A1:K1');
  const participantsTitleCell = participantsSheet.getCell('A1');
  participantsTitleCell.value = 'PARTICIPANTS LIST / បញ្ជីអ្នកចូលរួម';
  participantsTitleCell.font = { bold: true, size: 16 };
  participantsTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  participantsTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2D9596' },
  };

  // Column Headers
  const headers = [
    'No.',
    'Teacher ID\nលេខសម្គាល់គ្រូ',
    'Name (KM)\nឈ្មោះ',
    'Name (EN)\nឈ្មោះ',
    'Sex\nភេទ',
    'Phone\nទូរស័ព្ទ',
    'Province\nខេត្ត',
    'District\nស្រុក',
    'School\nសាលា',
    'Position\nតួនាទី',
    'Attendance %\nភាគរយវត្តមាន',
  ];

  participantsSheet.getRow(3).values = headers;
  participantsSheet.getRow(3).font = { bold: true };
  participantsSheet.getRow(3).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  participantsSheet.getRow(3).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4E6F1' },
  };
  participantsSheet.getRow(3).height = 40;

  // Set column widths
  participantsSheet.getColumn(1).width = 6;
  participantsSheet.getColumn(2).width = 18;
  participantsSheet.getColumn(3).width = 25;
  participantsSheet.getColumn(4).width = 25;
  participantsSheet.getColumn(5).width = 8;
  participantsSheet.getColumn(6).width = 15;
  participantsSheet.getColumn(7).width = 15;
  participantsSheet.getColumn(8).width = 15;
  participantsSheet.getColumn(9).width = 25;
  participantsSheet.getColumn(10).width = 15;
  participantsSheet.getColumn(11).width = 12;

  // Add participant data
  data.participants.forEach((participant, index) => {
    const rowData = [
      index + 1,
      participant.beneficiary.teacher_id,
      participant.beneficiary.name,
      participant.beneficiary.name_english || '',
      participant.beneficiary.sex || '',
      participant.beneficiary.phone || '',
      participant.beneficiary.province_name || '',
      participant.beneficiary.district_name || '',
      participant.beneficiary.school || '',
      participant.beneficiary.position || '',
      participant.attendance_percentage ? `${participant.attendance_percentage.toFixed(1)}%` : '0%',
    ];

    const rowNum = index + 4;
    participantsSheet.getRow(rowNum).values = rowData;
    participantsSheet.getRow(rowNum).alignment = { vertical: 'middle' };

    // Alternate row colors
    if (index % 2 === 0) {
      participantsSheet.getRow(rowNum).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8F9FA' },
      };
    }
  });

  // Create Attendance Details Sheet
  const attendanceSheet = workbook.addWorksheet('Attendance Details', {
    properties: { defaultRowHeight: 20 },
  });

  // Get all unique dates from attendance records
  const allDates = new Set<string>();
  data.participants.forEach(p => {
    p.attendanceRecords.forEach(record => {
      allDates.add(record.date);
    });
  });
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
  data.participants.forEach((participant, index) => {
    const rowNum = index + 5;
    const row = attendanceSheet.getRow(rowNum);

    row.getCell(1).value = index + 1;
    row.getCell(2).value = participant.beneficiary.teacher_id;
    row.getCell(3).value = participant.beneficiary.name;

    // Create a map of attendance records by date
    const attendanceMap = new Map<string, AttendanceRecord>();
    participant.attendanceRecords.forEach(record => {
      attendanceMap.set(record.date, record);
    });

    colIndex = 4;
    sortedDates.forEach(date => {
      const record = attendanceMap.get(date);

      if (record) {
        // Morning In
        row.getCell(colIndex).value = record.morning_in ? format(new Date(record.morning_in), 'HH:mm') : '-';
        // Morning Out
        row.getCell(colIndex + 1).value = record.morning_out ? format(new Date(record.morning_out), 'HH:mm') : '-';
        // Afternoon In
        row.getCell(colIndex + 2).value = record.afternoon_in ? format(new Date(record.afternoon_in), 'HH:mm') : '-';
        // Afternoon Out
        row.getCell(colIndex + 3).value = record.afternoon_out ? format(new Date(record.afternoon_out), 'HH:mm') : '-';

        // Color code based on status
        const statusColors: Record<string, string> = {
          PRESENT: 'FF90EE90',
          ABSENT: 'FFFFA07A',
          LATE: 'FFFFD700',
          EXCUSED: 'FFADD8E6',
        };

        const color = statusColors[record.session_attendance_status] || 'FFFFFFFF';
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

  // Add borders to all sheets
  [infoSheet, participantsSheet, attendanceSheet].forEach(sheet => {
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
  const filename = `${data.training.training_code}_Participants_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

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
