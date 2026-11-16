// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { TimeColumnPlugin } from '../../src/datagrid/columns/types/TimeColumn/index';
import { paintTime } from '../../src/datagrid/columns/types/TimeColumn/TimePainter';
import { TimeEditor } from '../../src/datagrid/columns/types/TimeColumn/TimeEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('TimeColumnPlugin & TimePainter', () => {
  const defaultColumn: ColumnDef = { id: 'time', title: 'Time', width: 120, type: 'time' };

  describe('Plugin Definition', () => {
    it('should have correct type and editor component', () => {
      expect(TimeColumnPlugin.type).toBe('time');
      expect(TimeColumnPlugin.editorComponent).toBe(TimeEditor);
      expect(TimeColumnPlugin.paint).toBe(paintTime);
    });
  });

  describe('onPointerDown', () => {
    it('should handle click and trigger editor when clicking clock icon on the right (> width - 28)', () => {
      // column width 120 -> threshold is 120 - 28 = 92
      const setValue = vi.fn();
      const result = TimeColumnPlugin.onPointerDown?.({
        localX: 95,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '10:00',
        setValue,
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should not handle click when clicking inside cell content area (<= width - 28)', () => {
      const setValue = vi.fn();
      const result = TimeColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '10:00',
        setValue,
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Enter key with preventDefault', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();
      const setValue = vi.fn();
      const event = { key: 'Enter', preventDefault } as any;

      const handled = TimeColumnPlugin.onKeyDown?.({
        event,
        openEditor,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '09:30',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();
    });

    it('should open editor on Space key with preventDefault', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();
      const setValue = vi.fn();
      const event = { key: ' ', preventDefault } as any;

      const handled = TimeColumnPlugin.onKeyDown?.({
        event,
        openEditor,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '09:30',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();
    });

    it('should open editor with initial digit when pressing number key 0-9', () => {
      for (const digit of ['0', '1', '2', '5', '9']) {
        const openEditor = vi.fn();
        const preventDefault = vi.fn();
        const setValue = vi.fn();
        const event = { key: digit, preventDefault } as any;

        const handled = TimeColumnPlugin.onKeyDown?.({
          event,
          openEditor,
          setValue,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '09:30',
        });

        expect(handled).toBe(true);
        expect(preventDefault).toHaveBeenCalled();
        expect(openEditor).toHaveBeenCalledWith(digit);
      }
    });

    it('should ignore digit keys when modifier keys (ctrl, meta, alt) are pressed', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();
      const setValue = vi.fn();

      const ctrlEvent = { key: '2', ctrlKey: true, preventDefault } as any;
      expect(
        TimeColumnPlugin.onKeyDown?.({
          event: ctrlEvent,
          openEditor,
          setValue,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '09:30',
        })
      ).toBe(false);

      const altEvent = { key: '3', altKey: true, preventDefault } as any;
      expect(
        TimeColumnPlugin.onKeyDown?.({
          event: altEvent,
          openEditor,
          setValue,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '09:30',
        })
      ).toBe(false);

      expect(openEditor).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should return false for non-triggering keys like letters, arrow keys, or escape', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();
      const setValue = vi.fn();

      for (const key of ['a', 'z', 'ArrowDown', 'Escape', 'Backspace']) {
        const event = { key, preventDefault } as any;
        const handled = TimeColumnPlugin.onKeyDown?.({
          event,
          openEditor,
          setValue,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '09:30',
        });

        expect(handled).toBe(false);
      }

      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('Clipboard & Comparator', () => {
    it('should trim text in parseClipboard', () => {
      expect(TimeColumnPlugin.parseClipboard?.('  14:45  ', defaultColumn)).toBe('14:45');
      expect(TimeColumnPlugin.parseClipboard?.('', defaultColumn)).toBe('');
    });

    it('should format clipboard values safely', () => {
      expect(TimeColumnPlugin.formatClipboard?.('08:15', defaultColumn)).toBe('08:15');
      expect(TimeColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(TimeColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });

    it('should compare time values lexicographically', () => {
      expect(TimeColumnPlugin.comparator?.('08:00', '12:00')).toBeLessThan(0);
      expect(TimeColumnPlugin.comparator?.('15:30', '09:15')).toBeGreaterThan(0);
      expect(TimeColumnPlugin.comparator?.('14:00', '14:00')).toBe(0);
      expect(TimeColumnPlugin.comparator?.(null as any, '09:00')).toBeLessThan(0);
    });
  });

  describe('paintTime (Canvas Rendering)', () => {
    const createMockCtx = () => {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        arc: vi.fn(),
        stroke: vi.fn(),
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

    it('should paint text and clock icon when cell has valid value and width > 55', () => {
      const mockCtx = createMockCtx();

      paintTime({
        ctx: mockCtx,
        value: '14:30',
        theme: appleLight,
        locale: enUS,
        x: 10,
        y: 20,
        width: 100,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: { id: 'time', title: 'Time', width: 100, type: 'time' },
        row: {},
        rowIndex: 0,
      });

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Text rendering
      expect(mockCtx.clip).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('14:30', 10 + 8, 20 + 15);

      // Clock icon rendering
      expect(mockCtx.arc).toHaveBeenCalledWith(
        10 + 100 - 14, // cx = x + width - 14 = 96
        20 + 15,       // cy = y + height / 2 = 35
        5.5,           // r = 5.5
        0,
        Math.PI * 2
      );
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should skip text rendering when value is empty or null', () => {
      const mockCtx = createMockCtx();

      paintTime({
        ctx: mockCtx,
        value: '',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 80,
        height: 25,
        isHovered: false,
        isSelected: false,
        column: { id: 'time', title: 'Time', width: 80, type: 'time' },
        row: {},
        rowIndex: 0,
      });

      expect(mockCtx.fillText).not.toHaveBeenCalled();
      // But clock icon is still drawn if width > 55
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should skip clock icon when cell width is narrow (<= 55)', () => {
      const mockCtx = createMockCtx();

      paintTime({
        ctx: mockCtx,
        value: '10:00',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 50, // narrow width <= 55
        height: 25,
        isHovered: false,
        isSelected: false,
        column: { id: 'time', title: 'Time', width: 50, type: 'time' },
        row: {},
        rowIndex: 0,
      });

      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });

    it('should use theme accentColor when cell is hovered or selected', () => {
      const mockCtx = createMockCtx();

      paintTime({
        ctx: mockCtx,
        value: '12:00',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 90,
        height: 30,
        isHovered: true,
        isSelected: false,
        column: { id: 'time', title: 'Time', width: 90, type: 'time' },
        row: {},
        rowIndex: 0,
      });

      expect(mockCtx.strokeStyle).toBe(appleLight.dom.accentColor);
    });

    it('should use dark mode muted color when theme is dark and not hovered/selected', () => {
      const mockCtx = createMockCtx();

      paintTime({
        ctx: mockCtx,
        value: '12:00',
        theme: appleDark,
        locale: enUS,
        x: 0,
        y: 0,
        width: 90,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: { id: 'time', title: 'Time', width: 90, type: 'time' },
        row: {},
        rowIndex: 0,
      });

      expect(mockCtx.strokeStyle).toBe('rgba(255,255,255,0.38)');
    });
  });
});
