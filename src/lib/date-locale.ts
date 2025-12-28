import { format, formatDistance, formatRelative, Locale } from 'date-fns';

const khmerLocale: Locale = {
  code: 'km',
  formatDistance: (token, count, options) => {
    const khmrNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const toKhmerNumber = (n: number) =>
      n.toString().split('').map((d) => khmrNumbers[parseInt(d)] || d).join('');

    let result = '';

    switch (token) {
      case 'lessThanXSeconds':
        result = `តិចជា ${toKhmerNumber(count)} វិនាទី`;
        break;
      case 'xSeconds':
        result = `${toKhmerNumber(count)} វិនាទី`;
        break;
      case 'halfAMinute':
        result = 'កន្លះនាទី';
        break;
      case 'lessThanXMinutes':
        result = `តិចជា ${toKhmerNumber(count)} នាទី`;
        break;
      case 'xMinutes':
        result = `${toKhmerNumber(count)} នាទី`;
        break;
      case 'xHours':
        result = `${toKhmerNumber(count)} ម៉ោង`;
        break;
      case 'lessThanXHours':
        result = `តិចជា ${toKhmerNumber(count)} ម៉ោង`;
        break;
      case 'xDays':
        result = `${toKhmerNumber(count)} ថ្ងៃ`;
        break;
      case 'lessThanXDays':
        result = `តិចជា ${toKhmerNumber(count)} ថ្ងៃ`;
        break;
      case 'xMonths':
        result = `${toKhmerNumber(count)} ខែ`;
        break;
      case 'xYears':
        result = `${toKhmerNumber(count)} ឆ្នាំ`;
        break;
      case 'overXYears':
        result = `លើស ${toKhmerNumber(count)} ឆ្នាំ`;
        break;
      case 'almostXYears':
        result = `ជិត ${toKhmerNumber(count)} ឆ្នាំ`;
        break;
      default:
        result = token;
    }

    if (options?.addSuffix) {
      result += ' កន្លងមក';
    }

    return result;
  },
  formatRelative: (token, date, baseDate, options) => {
    const khmrNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const toKhmerNumber = (n: number) =>
      n.toString().split('').map((d) => khmrNumbers[parseInt(d)] || d).join('');

    switch (token) {
      case 'lastWeek':
        return `សប្តាហ៍មុន dddd p`;
      case 'yesterday':
        return 'ម្សិលមិញ p';
      case 'today':
        return 'ថ្ងៃនេះ p';
      case 'tomorrow':
        return 'ថ្ងៃស្អាត p';
      case 'nextWeek':
        return `សប្តាហ៍ក្រោយ dddd p`;
      case 'other':
        return token;
      default:
        return token;
    }
  },
  localize: {
    ordinal: (n) => {
      const khmrNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const toKhmerNumber = (num: number) =>
        num.toString().split('').map((d) => khmrNumbers[parseInt(d)] || d).join('');
      return toKhmerNumber(n);
    },
    unit: (token, type, context) => {
      const khmrNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const toKhmerNumber = (n: number) =>
        n.toString().split('').map((d) => khmrNumbers[parseInt(d)] || d).join('');

      switch (token) {
        case 'year':
          return { long: '�្នាំ', short: '�្នាំ' };
        case 'month':
          return { long: 'ខែ', short: 'ខែ' };
        case 'week':
          return { long: 'សប្តាហ៍', short: 'សប្តាហ៍' };
        case 'day':
          return { long: 'ថ្ងៃ', short: 'ថ្ងៃ' };
        case 'hour':
          return { long: 'ម៉ោង', short: 'ម៉' };
        case 'minute':
          return { long: 'នាទី', short: 'ន' };
        case 'second':
          return { long: '�ិនាទី', short: '�' };
        default:
          return { long: token, short: token };
      }
    },
  },
  match: {
    ordinal: (n) => n,
    units: {
      year: /�្នាំ/i,
      month: /ខែ/i,
      week: /សប្តាហ៍/i,
      day: /ថ្ងៃ/i,
      hour: /ម៉ោង/i,
      minute: /នាទី/i,
      second: /�ិនាទី/i,
    },
  },
  options: {
    weekStartsOn: 0 as const,
    firstWeekContainsDate: 1 as const,
  },
};

export { khmerLocale };
