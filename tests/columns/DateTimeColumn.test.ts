// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { DateTimeColumnPlugin } from '../../src/datagrid/columns/types/DateTimeColumn/index';
import {
  paintDateTime,
  formatDateTimeDisplay,
} from '../../src/datagrid/columns/types/DateTimeColumn/DateTimePainter';
import { DateTimeEditor } from '../../src/datagrid/columns/types/DateTimeColumn/DateTimeEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('DateTimeColumnPlugin & DateTimePainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'created_at',
    title: 'Oluşturulma',
    width: 200,
    type: 'datetime',
  };

  describe('Plugin Definition', () => {
    it('should have correct type and components', () => {
      expect(DateTimeColumnPlugin.type).toBe('datetime');
      expect(DateTimeColumnPlugin.editorComponent).toBe(DateTimeEditor);
      expect(DateTimeColumnPlugin.paint).toBe(paintDateTime);
    });
  });

  describe('onPointerDown (Hit-Testing)', () => {
    it('should trigger editor when clicking on right calendar/clock icon area (> width - 28)', () => {
      const result = DateTimeColumnPlugin.onPointerDown?.({
        localX: 185, // 200 - 28 = 172 -> 185 is in icon area
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-16 14:30',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should not handle click when clicking content area (<= width - 28)', () => {
      const result = DateTimeColumnPlugin.onPointerDown?.({
        localX: 100,
        localY: 15,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-16 14:30',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Enter or Space key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = DateTimeColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-16 14:30',
      });

      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      const spaceHandled = DateTimeColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-16 14:30',
      });

      expect(spaceHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledTimes(2);
    });

    it('should open editor with initial character when pressing digit keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = DateTimeColumnPlugin.onKeyDown?.({
        event: { key: '2', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-16 14:30',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('2');
    });

    it('should ignore keys with modifier keys (ctrl, meta, alt)', () => {
      const openEditor = vi.fn();

      const handled = DateTimeColumnPlugin.onKeyDown?.({
        event: { key: '2', ctrlKey: true, preventDefault: vi.fn() } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '2026-11-16 14:30',
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should parse Turkish dot-delimited date-time string (16.11.2026 14:30)', () => {
      const parsed = DateTimeColumnPlugin.parseClipboard?.('16.11.2026 14:30', defaultColumn);
      expect(parsed).toBe('2026-11-16 14:30');
    });

    it('should default to 09:00 when time part is missing from dot-delimited date', () => {
      const parsed = DateTimeColumnPlugin.parseClipboard?.('16.11.2026', defaultColumn);
      expect(parsed).toBe('2026-11-16 09:00');
    });

    it('should parse 8-digit raw numeric string like 16112026 or 20261116', () => {
      const parsedYmd = DateTimeColumnPlugin.parseClipboard?.('20261116', defaultColumn);
      expect(parsedYmd).toBe('2026-11-16 09:00');

      const parsedDmy = DateTimeColumnPlugin.parseClipboard?.('16112026', defaultColumn);
      expect(parsedDmy).toBe('2026-11-16 09:00');
    });

    it('should return raw text when no pattern matches', () => {
      expect(DateTimeColumnPlugin.parseClipboard?.('invalid-date', defaultColumn)).toBe('invalid-date');
    });
  });

  describe('formatClipboard', () => {
    it('should return stringified value or empty string', () => {
      expect(DateTimeColumnPlugin.formatClipboard?.('2026-11-16 14:30', defaultColumn)).toBe('2026-11-16 14:30');
      expect(DateTimeColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(DateTimeColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare ISO date-time strings chronologically', () => {
      const cmp = DateTimeColumnPlugin.comparator!;
      expect(cmp('2026-11-16 10:00', '2026-11-16 14:30')).toBeLessThan(0);
      expect(cmp('2026-11-17 09:00', '2026-11-16 14:30')).toBeGreaterThan(0);
      expect(cmp('2026-11-16 12:00', '2026-11-16 12:00')).toBe(0);
    });
  });

  describe('formatDateTimeDisplay', () => {
    it('should separate datePart and timePart accurately in Turkish locale', () => {
      const res = formatDateTimeDisplay('2026-11-16 14:30', 'tr-TR');
      expect(res.datePart).toMatch(/\d{2}[/.]\d{2}[/.]\d{4}/);
      expect(res.timePart).toBe('14:30');
    });

    it('should separate datePart and timePart in English locale', () => {
      const res = formatDateTimeDisplay('2026-11-16 09:15', 'en-US');
      expect(res.datePart).toMatch(/\d{2}[/.]\d{2}[/.]\d{4}/);
      expect(res.timePart).toBe('09:15');
    });

    it('should return empty parts for null or empty value', () => {
      expect(formatDateTimeDisplay('')).toEqual({ datePart: '', timePart: '' });
      expect(formatDateTimeDisplay(null as any)).toEqual({ datePart: '', timePart: '' });
    });
  });

  describe('paintDateTime (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        strokeRect: vi.fn(),
        clip: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render date text and cyan time pill badge in light theme', () => {
      const ctx = createMockContext();
      paintDateTime({
        ctx,
        value: '2026-11-16 14:30',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith(expect.stringMatching(/\d{2}[/.]\d{2}[/.]\d{4}/), expect.any(Number), expect.any(Number));
      expect(ctx.fillText).toHaveBeenCalledWith('14:30', expect.any(Number), expect.any(Number));
      expect(ctx.fill).toHaveBeenCalled(); // Pill fill
    });

    it('should render dark theme time pill colors and stroke calendar icon', () => {
      const ctx = createMockContext();
      paintDateTime({
        ctx,
        value: '2026-11-16 14:30',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.strokeRect).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should not throw on null or undefined value', () => {
      const ctx = createMockContext();
      expect(() => {
        paintDateTime({
          ctx,
          value: null as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 200,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
          locale: trTR,
        });
      }).not.toThrow();
    });
  });
});
