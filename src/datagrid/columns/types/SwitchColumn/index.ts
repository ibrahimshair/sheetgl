import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintSwitch } from './SwitchPainter';

export const SwitchColumnPlugin: IColumnTypePlugin<boolean> = {
  type: 'switch',
  paint: paintSwitch,
  editorComponent: undefined,

  onPointerDown({ value, setValue }) {
    setValue(!value);
    return { handled: true };
  },

  onKeyDown({ event, value, setValue }) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setValue(!value);
      return true;
    }
    return false;
  },

  parseClipboard(text) {
    const clean = text.trim().toLowerCase();
    return ['true', '1', 'evet', 'aktif', 'yes', 'doğru', 'on'].includes(clean);
  },

  formatClipboard(value) {
    return value ? 'DOĞRU' : 'YANLIŞ';
  },

  comparator(a, b) {
    return a === b ? 0 : a ? 1 : -1;
  },
};

