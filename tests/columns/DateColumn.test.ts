// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { DateColumnPlugin } from '../../src/datagrid/columns/types/DateColumn/index';
import { paintDate } from '../../src/datagrid/columns/types/DateColumn/DatePainter';
import { DateEditor } from '../../src/datagrid/columns/types/DateColumn/DateEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('DateColumnPlugin & DatePainter', () => {
  const defaultColumn: ColumnDef = { id: 'created_at', title: 'Tarih', width: 140, type: 'date' };

  describe('Plugin Definition', () => {
    it('should have correct type, editorComponent, and paint function', () => {
      expect(DateColumnPlugin.type).toBe('date');
      expect(DateColumnPlugin.editorComponent).toBe(DateEditor);
      expect(DateColumnPlugin.paint).toBe(paintDate);
    });
  });

  describe('onPointerDown (Hit-Testing)', () => {
    it('should trigger editor when clicking on the right calendar icon area (> width - 28)', () => {
      // 140 - 28 = 112 -> 120 is inside the right icon area
      const result = DateColumnPlugin.onPointerDown?.({
        localX: 120,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-13',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should not handle click when clicking inside cell content area (<= width - 28)', () => {
      const result = DateColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-13',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Enter or Space key with preventDefault', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = DateColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-13',
      });

      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      const spaceHandled = DateColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-13',
      });

      expect(spaceHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledTimes(2);
    });

    it('should open editor with digit when pressing number key 0-9', () => {
      for (const digit of ['0', '1', '2', '5', '9']) {
        const openEditor = vi.fn();
        const preventDefault = vi.fn();

        const handled = DateColumnPlugin.onKeyDown?.({
          event: { key: digit, preventDefault } as any,
          openEditor,
          setValue: vi.fn(),
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '2026-11-13',
        });

        expect(handled).toBe(true);
        expect(preventDefault).toHaveBeenCalled();
        expect(openEditor).toHaveBeenCalledWith(digit);
      }
    });

    it('should ignore digit keys when modifier keys (ctrl, meta, alt) are pressed', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handledCtrl = DateColumnPlugin.onKeyDown?.({
        event: { key: '5', ctrlKey: true, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-13',
      });

      expect(handledCtrl).toBe(false);

      const handledAlt = DateColumnPlugin.onKeyDown?.({
        event: { key: '5', altKey: true, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-13',
      });

      expect(handledAlt).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });

    it('should return false for non-numeric keys like letters or arrows', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      for (const key of ['a', 'z', 'ArrowDown', 'Escape', 'Backspace']) {
        const handled = DateColumnPlugin.onKeyDown?.({
          event: { key, preventDefault } as any,
          openEditor,
          setValue: vi.fn(),
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: '2026-11-13',
        });

        expect(handled).toBe(false);
      }
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard (Date Normalization)', () => {
    it('should normalize DD.MM.YYYY and DD/MM/YYYY to ISO YYYY-MM-DD', () => {
      expect(DateColumnPlugin.parseClipboard?.('16.02.1988', defaultColumn)).toBe('1988-02-16');
      expect(DateColumnPlugin.parseClipboard?.('09/11/2026', defaultColumn)).toBe('2026-11-09');
      expect(DateColumnPlugin.parseClipboard?.('5-3-2026', defaultColumn)).toBe('2026-03-05');
    });

    it('should convert 8-digit compact strings to ISO format', () => {
      // YYYYMMDD
      expect(DateColumnPlugin.parseClipboard?.('19880216', defaultColumn)).toBe('1988-02-16');
      expect(DateColumnPlugin.parseClipboard?.('20261113', defaultColumn)).toBe('2026-11-13');

      // DDMMYYYY
      expect(DateColumnPlugin.parseClipboard?.('16021988', defaultColumn)).toBe('1988-02-16');
      expect(DateColumnPlugin.parseClipboard?.('13112026', defaultColumn)).toBe('2026-11-13');
    });

    it('should return raw trimmed string if not matched', () => {
      expect(DateColumnPlugin.parseClipboard?.('2026-11-13', defaultColumn)).toBe('2026-11-13');
      expect(DateColumnPlugin.parseClipboard?.('  invalid-date  ', defaultColumn)).toBe('invalid-date');
    });
  });

  describe('formatClipboard & comparator', () => {
    it('should format clipboard value safely', () => {
      expect(DateColumnPlugin.formatClipboard?.('2026-11-13', defaultColumn)).toBe('2026-11-13');
      expect(DateColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(DateColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });

    it('should compare dates chronologically', () => {
      expect(DateColumnPlugin.comparator?.('2026-01-01', '2026-12-31')).toBeLessThan(0);
      expect(DateColumnPlugin.comparator?.('2026-12-31', '2026-01-01')).toBeGreaterThan(0);
      expect(DateColumnPlugin.comparator?.('2026-05-15', '2026-05-15')).toBe(0);
      expect(DateColumnPlugin.comparator?.(null as any, '2026-01-01')).toBeLessThan(0);
    });
  });

  describe('paintDate (Canvas Rendering)', () => {
    const createMockCtx = () => {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        strokeRect: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 1,
      } as any;
    };

    it('should render localized date text and calendar icon when value is provided and width > 60', () => {
      const mockCtx = createMockCtx();

      paintDate({
        ctx: mockCtx,
        value: '2026-11-13',
        theme: appleLight,
        locale: trTR,
        x: 10,
        y: 20,
        width: 140,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: defaultColumn,
      });

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Text clip and render
      expect(mockCtx.clip).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith(expect.any(String), 10 + 8, 20 + 15);

      // Calendar icon strokeRect and lines
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should skip text rendering when value is empty or null', () => {
      const mockCtx = createMockCtx();

      paintDate({
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

      expect(mockCtx.fillText).not.toHaveBeenCalled();
      // Calendar icon is still drawn if width > 60
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('should skip calendar icon when width <= 60', () => {
      const mockCtx = createMockCtx();

      paintDate({
        ctx: mockCtx,
        value: '2026-11-13',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 50, // narrow width <= 60
        height: 30,
        isHovered: false,
        isSelected: false,
        column: { ...defaultColumn, width: 50 },
      });

      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
    });

    it('should use theme accentColor when hovered or selected', () => {
      const mockCtx = createMockCtx();

      paintDate({
        ctx: mockCtx,
        value: '2026-11-13',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        isHovered: true,
        isSelected: false,
        column: defaultColumn,
      });

      expect(mockCtx.strokeStyle).toBe(appleLight.dom.accentColor);
    });

    it('should use dark mode muted stroke in appleDark when not hovered', () => {
      const mockCtx = createMockCtx();

      paintDate({
        ctx: mockCtx,
        value: '2026-11-13',
        theme: appleDark,
        locale: enUS,
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: defaultColumn,
      });

      expect(mockCtx.strokeStyle).toBe('rgba(255,255,255,0.35)');
    });
  });
});
