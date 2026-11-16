// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { NumberColumnPlugin } from '../../src/datagrid/columns/types/NumberColumn/index';
import { paintNumber } from '../../src/datagrid/columns/types/NumberColumn/NumberPainter';
import { NumberEditor } from '../../src/datagrid/columns/types/NumberColumn/NumberEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('NumberColumnPlugin & NumberPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'quantity',
    title: 'Adet',
    width: 120,
    type: 'number',
  };

  describe('Plugin Definition', () => {
    it('should have correct type and components', () => {
      expect(NumberColumnPlugin.type).toBe('number');
      expect(NumberColumnPlugin.editorComponent).toBe(NumberEditor);
      expect(NumberColumnPlugin.paint).toBe(paintNumber);
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on numeric and sign keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const digitHandled = NumberColumnPlugin.onKeyDown?.({
        event: { key: '5', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 10,
      });

      expect(digitHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('5');

      const commaHandled = NumberColumnPlugin.onKeyDown?.({
        event: { key: ',', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 10,
      });

      expect(commaHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith(',');

      const minusHandled = NumberColumnPlugin.onKeyDown?.({
        event: { key: '-', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 10,
      });

      expect(minusHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith('-');
    });

    it('should ignore keys with modifier keys (ctrl, meta, alt)', () => {
      const openEditor = vi.fn();

      const handled = NumberColumnPlugin.onKeyDown?.({
        event: { key: '5', ctrlKey: true, preventDefault: vi.fn() } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 10,
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });

    it('should ignore non-numeric keys', () => {
      const openEditor = vi.fn();

      const handled = NumberColumnPlugin.onKeyDown?.({
        event: { key: 'a', preventDefault: vi.fn() } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 10,
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should parse clean numeric strings', () => {
      expect(NumberColumnPlugin.parseClipboard?.('1234', defaultColumn)).toBe(1234);
      expect(NumberColumnPlugin.parseClipboard?.('-45', defaultColumn)).toBe(-45);
    });

    it('should parse formatted numbers with dots and commas', () => {
      expect(NumberColumnPlugin.parseClipboard?.('1.250,50', defaultColumn)).toBe(1250.5);
      expect(NumberColumnPlugin.parseClipboard?.('50,75', defaultColumn)).toBe(50.75);
    });

    it('should fallback to 0 for invalid non-numeric strings', () => {
      expect(NumberColumnPlugin.parseClipboard?.('not-a-number', defaultColumn)).toBe(0);
      expect(NumberColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(0);
    });
  });

  describe('formatClipboard', () => {
    it('should format number as string', () => {
      expect(NumberColumnPlugin.formatClipboard?.(42, defaultColumn)).toBe('42');
      expect(NumberColumnPlugin.formatClipboard?.(12.34, defaultColumn)).toBe('12.34');
      expect(NumberColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(NumberColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare numbers accurately', () => {
      const cmp = NumberColumnPlugin.comparator!;
      expect(cmp(10, 20)).toBeLessThan(0);
      expect(cmp(50, 20)).toBeGreaterThan(0);
      expect(cmp(15, 15)).toBe(0);
    });

    it('should handle null or non-numeric values gracefully', () => {
      const cmp = NumberColumnPlugin.comparator!;
      expect(cmp(null as any, 10)).toBeLessThan(0);
      expect(cmp(10, null as any)).toBeGreaterThan(0);
      expect(cmp(null as any, undefined as any)).toBe(0);
    });
  });

  describe('paintNumber (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render integer number without decimal places', () => {
      const ctx = createMockContext();
      paintNumber({
        ctx,
        value: 1500,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 120,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('1.500', expect.any(Number), expect.any(Number));
    });

    it('should format float numbers using default 2 decimal digits', () => {
      const ctx = createMockContext();
      paintNumber({
        ctx,
        value: 1234.56,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 120,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('1.234,56', expect.any(Number), expect.any(Number));
    });

    it('should respect custom decimalDigits configuration', () => {
      const ctx = createMockContext();
      paintNumber({
        ctx,
        value: 12.3456,
        column: { ...defaultColumn, decimalDigits: 3 },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 120,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('12.346', expect.any(Number), expect.any(Number));
    });

    it('should render id column truncated without group separators', () => {
      const ctx = createMockContext();
      paintNumber({
        ctx,
        value: 9876543,
        column: { ...defaultColumn, id: 'id' },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 120,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('9876543', expect.any(Number), expect.any(Number));
    });

    it('should apply red color to negative numbers in light and dark themes', () => {
      const ctxLight = createMockContext();
      paintNumber({
        ctx: ctxLight,
        value: -250,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 120,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctxLight.fillStyle).toBe('#DC2626');

      const ctxDark = createMockContext();
      paintNumber({
        ctx: ctxDark,
        value: -250,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 120,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctxDark.fillStyle).toBe('#FF453A');
    });

    it('should respect column align configuration (left, center, right)', () => {
      const ctxCenter = createMockContext();
      paintNumber({
        ctx: ctxCenter,
        value: 100,
        column: { ...defaultColumn, align: 'center' },
        row: {},
        rowIndex: 0,
        x: 10,
        y: 0,
        width: 100,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctxCenter.textAlign).toBe('center');
      expect(ctxCenter.fillText).toHaveBeenCalledWith('100', 60, 17);

      const ctxLeft = createMockContext();
      paintNumber({
        ctx: ctxLeft,
        value: 100,
        column: { ...defaultColumn, align: 'left' },
        row: {},
        rowIndex: 0,
        x: 10,
        y: 0,
        width: 100,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctxLeft.textAlign).toBe('left');
      expect(ctxLeft.fillText).toHaveBeenCalledWith('100', 20, 17);
    });

    it('should not throw on null, undefined, or NaN values', () => {
      const ctx = createMockContext();
      expect(() => {
        paintNumber({
          ctx,
          value: null as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 100,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
          locale: trTR,
        });
        paintNumber({
          ctx,
          value: NaN as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 100,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
          locale: trTR,
        });
      }).not.toThrow();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });
});
