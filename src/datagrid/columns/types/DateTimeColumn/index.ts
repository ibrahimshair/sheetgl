import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintDateTime } from './DateTimePainter';
import { DateTimeEditor } from './DateTimeEditor';

export const DateTimeColumnPlugin: IColumnTypePlugin<string> = {
  type: 'datetime',
  paint: paintDateTime,
  editorComponent: DateTimeEditor,

  onPointerDown({ localX, column }) {
    if (localX > column.width - 28) {
      return { handled: true, shouldOpenEditor: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, openEditor }) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEditor();
      return true;
    }
    if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openEditor(event.key);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const raw = text.trim();
    const dmy = raw.match(
      /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/
    );
    if (dmy) {
      const hh = (dmy[4] || '09').padStart(2, '0');
      const mm = (dmy[5] || '00').padStart(2, '0');
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')} ${hh}:${mm}`;
    }
    // Convert 8-digit raw numeric string like 16021988 (DDMMYYYY) or 19880216 (YYYYMMDD)
    if (/^\d{8}$/.test(raw)) {
      const pYear = parseInt(raw.slice(0, 4), 10);
      const pMonth = parseInt(raw.slice(4, 6), 10);
      const pDay = parseInt(raw.slice(6, 8), 10);
      if (pYear >= 1900 && pYear <= 2099 && pMonth >= 1 && pMonth <= 12 && pDay >= 1 && pDay <= 31) {
        return `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')} 09:00`;
      }
      const dDay = parseInt(raw.slice(0, 2), 10);
      const dMonth = parseInt(raw.slice(2, 4), 10);
      const dYear = parseInt(raw.slice(4, 8), 10);
      if (dYear >= 1900 && dYear <= 2099 && dMonth >= 1 && dMonth <= 12 && dDay >= 1 && dDay <= 31) {
        return `${dYear}-${String(dMonth).padStart(2, '0')}-${String(dDay).padStart(2, '0')} 09:00`;
      }
    }
    return raw;
  },

  formatClipboard(value) {
    return value != null ? String(value) : '';
  },

  comparator(a, b) {
    const strA = String(a ?? '');
    const strB = String(b ?? '');
    return strA.localeCompare(strB);
  },
};
