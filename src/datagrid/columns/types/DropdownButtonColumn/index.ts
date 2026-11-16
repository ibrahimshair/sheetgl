import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintDropdownButton } from './DropdownButtonPainter';

export const DropdownButtonColumnPlugin: IColumnTypePlugin<any> = {
  type: 'dropdownbutton',
  paint: paintDropdownButton,

  onPointerDown({ column, row, rowIndex, value }) {
    if (column.actionMenuItems || column.options) {
      return { handled: true };
    }
    if (column.onActionClick) {
      column.onActionClick(row ?? value, rowIndex ?? 0);
      return { handled: true };
    }
    return { handled: false };
  },

  onKeyDown({ event, column, row, rowIndex, value }) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (column.actionMenuItems || column.options) {
        return true;
      }
      if (column.onActionClick) {
        column.onActionClick(row ?? value, rowIndex ?? 0);
        return true;
      }
    }
    return false;
  },

  formatClipboard(value, column) {
    if (typeof value === 'string' && value.trim()) return value;
    if (value && typeof value === 'object' && value.label) return String(value.label);
    return column.buttonText || column.title || '';
  },
};

