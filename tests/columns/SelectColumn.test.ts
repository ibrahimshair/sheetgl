// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { SelectColumnPlugin } from '../../src/datagrid/columns/types/SelectColumn/index';
import { paintSelect } from '../../src/datagrid/columns/types/SelectColumn/SelectPainter';
import { SelectEditor } from '../../src/datagrid/columns/types/SelectColumn/SelectEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef, SelectOption } from '../../src/datagrid/types/grid';

describe('SelectColumnPlugin & SelectPainter', () => {
  const sampleOptions: SelectOption[] = [
    { value: 'active', label: 'Aktif', bg: '#dcfce7', fg: '#166534' },
    { value: 'pending', label: 'Beklemede', bg: '#fef3c7', fg: '#92400e' },
    { value: 'rejected', label: 'Reddedildi', bg: '#fee2e2', fg: '#991b1b' },
    { value: 'archived', label: 'Arşiv', bg: '#e0f2fe', fg: '#075985' },
    { value: 'standard', label: 'Standart' }, // No badge background
  ];

  const defaultColumn: ColumnDef = {
    id: 'status',
    title: 'Durum',
    width: 150,
    type: 'select',
    options: sampleOptions,
  };

  describe('Plugin Definition', () => {
    it('should have correct type and editorComponent', () => {
      expect(SelectColumnPlugin.type).toBe('select');
      expect(SelectColumnPlugin.editorComponent).toBe(SelectEditor);
      expect(SelectColumnPlugin.paint).toBe(paintSelect);
    });
  });

  describe('onPointerDown (Hit-Testing)', () => {
    it('should trigger editor when clicking on the right arrow/caret area (> width - 28)', () => {
      const result = SelectColumnPlugin.onPointerDown?.({
        localX: 130, // 150 - 28 = 122 -> 130 is in arrow area
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'active',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should not handle click when clicking inside cell content area (<= width - 28)', () => {
      const result = SelectColumnPlugin.onPointerDown?.({
        localX: 60,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'active',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Enter or Space key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = SelectColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'active',
      });

      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      const spaceHandled = SelectColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'active',
      });

      expect(spaceHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledTimes(2);
    });

    it('should open editor with initial character when pressing single character key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = SelectColumnPlugin.onKeyDown?.({
        event: { key: 'a', length: 1, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'active',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('a');
    });

    it('should ignore single char keys when modifier keys (ctrl, meta, alt) are pressed', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = SelectColumnPlugin.onKeyDown?.({
        event: { key: 'c', ctrlKey: true, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'active',
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard (Resilient Enum Matching)', () => {
    it('should clean quotes and match exact value', () => {
      expect(SelectColumnPlugin.parseClipboard?.('"active"', defaultColumn)).toBe('active');
      expect(SelectColumnPlugin.parseClipboard?.("'pending'", defaultColumn)).toBe('pending');
    });

    it('should match case-insensitively by value', () => {
      expect(SelectColumnPlugin.parseClipboard?.('ACTIVE', defaultColumn)).toBe('active');
      expect(SelectColumnPlugin.parseClipboard?.('  Pending  ', defaultColumn)).toBe('pending');
    });

    it('should match case-insensitively by label', () => {
      expect(SelectColumnPlugin.parseClipboard?.('Aktif', defaultColumn)).toBe('active');
      expect(SelectColumnPlugin.parseClipboard?.('BEKLEMEDE', defaultColumn)).toBe('pending');
      expect(SelectColumnPlugin.parseClipboard?.('reddedildi', defaultColumn)).toBe('rejected');
    });

    it('should fallback to clean string if no option matches (out-of-enum value)', () => {
      expect(SelectColumnPlugin.parseClipboard?.('custom-state', defaultColumn)).toBe('custom-state');
      expect(SelectColumnPlugin.parseClipboard?.('"special-tag"', defaultColumn)).toBe('special-tag');
    });

    it('should return empty string for null, undefined or empty input', () => {
      expect(SelectColumnPlugin.parseClipboard?.('', defaultColumn)).toBe('');
      expect(SelectColumnPlugin.parseClipboard?.(null as any, defaultColumn)).toBe('');
      expect(SelectColumnPlugin.parseClipboard?.(undefined as any, defaultColumn)).toBe('');
    });
  });

  describe('formatClipboard', () => {
    it('should format matching value to its label', () => {
      expect(SelectColumnPlugin.formatClipboard?.('active', defaultColumn)).toBe('Aktif');
      expect(SelectColumnPlugin.formatClipboard?.('pending', defaultColumn)).toBe('Beklemede');
    });

    it('should resolve case-insensitively and fallback to raw value for unlisted options', () => {
      expect(SelectColumnPlugin.formatClipboard?.('ACTIVE', defaultColumn)).toBe('Aktif');
      expect(SelectColumnPlugin.formatClipboard?.('unlisted', defaultColumn)).toBe('unlisted');
      expect(SelectColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare strings using Turkish locale rules', () => {
      expect(SelectColumnPlugin.comparator?.('Aktif', 'Beklemede')).toBeLessThan(0);
      expect(SelectColumnPlugin.comparator?.('çarşı', 'dağ')).toBeLessThan(0);
      expect(SelectColumnPlugin.comparator?.('şeker', 'tuz')).toBeLessThan(0);
      expect(SelectColumnPlugin.comparator?.('same', 'same')).toBe(0);
    });
  });

  describe('paintSelect (Canvas Rendering)', () => {
    const createMockCtx = () => {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        clip: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 50 } as TextMetrics)),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 1,
      } as any;
    };

    it('should return early and not render when value is null or empty', () => {
      const mockCtx = createMockCtx();

      paintSelect({
        ctx: mockCtx,
        value: '',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 100,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: defaultColumn,
      });

      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it('should render colored badge when option has bg defined (light mode)', () => {
      const mockCtx = createMockCtx();

      paintSelect({
        ctx: mockCtx,
        value: 'active',
        theme: appleLight,
        locale: enUS,
        x: 10,
        y: 10,
        width: 120,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: defaultColumn,
      });

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Badge background fill
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('Aktif', expect.any(Number), expect.any(Number));
    });

    it('should adapt badge colors to dark mode and stroke border when darkFg is provided', () => {
      const darkOptionCol: ColumnDef = {
        ...defaultColumn,
        options: [
          { value: 'active', label: 'Aktif', darkBg: '#064e3b', darkFg: '#34d399' },
        ],
      };

      const mockCtx = createMockCtx();

      paintSelect({
        ctx: mockCtx,
        value: 'active',
        theme: appleDark,
        locale: enUS,
        x: 10,
        y: 10,
        width: 120,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: darkOptionCol,
      });

      expect(mockCtx.fill).toHaveBeenCalled();
      // Should stroke border in dark mode because darkFg is defined
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('Aktif', expect.any(Number), expect.any(Number));
    });

    it('should auto-ingest out-of-enum value and display fallback badge in a badge column', () => {
      const mockCtx = createMockCtx();

      paintSelect({
        ctx: mockCtx,
        value: 'UnknownStatus',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 150,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: defaultColumn, // Has badge options
      });

      expect(mockCtx.fillText).toHaveBeenCalledWith('UnknownStatus', expect.any(Number), expect.any(Number));
    });

    it('should draw arrow caret on hover when width > 36', () => {
      const mockCtx = createMockCtx();

      paintSelect({
        ctx: mockCtx,
        value: 'active',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        isHovered: true, // Hovered state draws arrow with accentColor
        isSelected: false,
        column: defaultColumn,
      });

      // Arrow caret drawing calls moveTo, lineTo, closePath and fill
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.fillStyle).toBe(appleLight.dom.accentColor);
    });
  });
});
