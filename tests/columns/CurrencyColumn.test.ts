// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { CurrencyColumnPlugin } from '../../src/datagrid/columns/types/CurrencyColumn/index';
import { paintCurrency } from '../../src/datagrid/columns/types/CurrencyColumn/CurrencyPainter';
import { NumberEditor } from '../../src/datagrid/columns/types/NumberColumn/NumberEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('CurrencyColumnPlugin & CurrencyPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'price',
    title: 'Fiyat',
    width: 140,
    type: 'currency',
    currencySymbol: '₺',
    decimalDigits: 2,
  };

  describe('Plugin Definition', () => {
    it('should have correct type and components', () => {
      expect(CurrencyColumnPlugin.type).toBe('currency');
      expect(CurrencyColumnPlugin.editorComponent).toBe(NumberEditor);
      expect(CurrencyColumnPlugin.paint).toBe(paintCurrency);
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on numeric and sign keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const digitHandled = CurrencyColumnPlugin.onKeyDown?.({
        event: { key: '7', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 100,
      });

      expect(digitHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('7');

      const dotHandled = CurrencyColumnPlugin.onKeyDown?.({
        event: { key: '.', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 100,
      });

      expect(dotHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith('.');
    });

    it('should ignore keys with modifier keys (ctrl, meta, alt)', () => {
      const openEditor = vi.fn();

      const handled = CurrencyColumnPlugin.onKeyDown?.({
        event: { key: '9', altKey: true, preventDefault: vi.fn() } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 100,
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should parse US format currency strings ($12,345.67)', () => {
      expect(CurrencyColumnPlugin.parseClipboard?.('$12,345.67', defaultColumn)).toBe(12345.67);
      expect(CurrencyColumnPlugin.parseClipboard?.('1,500.50', defaultColumn)).toBe(1500.5);
    });

    it('should parse TR/EU format currency strings (12.345,67 ₺)', () => {
      expect(CurrencyColumnPlugin.parseClipboard?.('12.345,67 ₺', defaultColumn)).toBe(12345.67);
      expect(CurrencyColumnPlugin.parseClipboard?.('1.500,50', defaultColumn)).toBe(1500.5);
      expect(CurrencyColumnPlugin.parseClipboard?.('250,75', defaultColumn)).toBe(250.75);
    });

    it('should parse negative currency amounts', () => {
      expect(CurrencyColumnPlugin.parseClipboard?.('-$50.25', defaultColumn)).toBe(-50.25);
      expect(CurrencyColumnPlugin.parseClipboard?.('-100,50 ₺', defaultColumn)).toBe(-100.5);
    });

    it('should fallback to 0 for non-numeric strings', () => {
      expect(CurrencyColumnPlugin.parseClipboard?.('Free', defaultColumn)).toBe(0);
      expect(CurrencyColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(0);
    });
  });

  describe('formatClipboard', () => {
    it('should format currency with column symbol', () => {
      expect(CurrencyColumnPlugin.formatClipboard?.(1500, defaultColumn)).toBe('1500 ₺');
    });

    it('should fallback to default dollar symbol when column symbol is missing', () => {
      const colNoSym: ColumnDef = { id: 'price', title: 'Price', width: 100, type: 'currency' };
      expect(CurrencyColumnPlugin.formatClipboard?.(250, colNoSym)).toBe('250 $');
    });

    it('should return empty string for null or undefined', () => {
      expect(CurrencyColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(CurrencyColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare currency values numerically', () => {
      const cmp = CurrencyColumnPlugin.comparator!;
      expect(cmp(100, 200)).toBeLessThan(0);
      expect(cmp(500, 200)).toBeGreaterThan(0);
      expect(cmp(150, 150)).toBe(0);
      expect(cmp(null as any, 50)).toBeLessThan(0);
    });
  });

  describe('paintCurrency (Canvas 2D Rendering)', () => {
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

    it('should render positive amount in TR locale with suffix symbol (1.500,00 ₺)', () => {
      const ctx = createMockContext();
      paintCurrency({
        ctx,
        value: 1500,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 140,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('1.500,00 ₺', expect.any(Number), expect.any(Number));
    });

    it('should render positive amount in EN locale with prefix symbol ($1,500.00)', () => {
      const ctx = createMockContext();
      paintCurrency({
        ctx,
        value: 1500,
        column: { ...defaultColumn, currencySymbol: '$' },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 140,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('$1,500.00', expect.any(Number), expect.any(Number));
    });

    it('should render negative amount in EN locale with formatted negative prefix (-$1,500.00)', () => {
      const ctx = createMockContext();
      paintCurrency({
        ctx,
        value: -1500,
        column: { ...defaultColumn, currencySymbol: '$' },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 140,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('-$1,500.00', expect.any(Number), expect.any(Number));
    });

    it('should color negative currency in red in light and dark themes', () => {
      const ctxLight = createMockContext();
      paintCurrency({
        ctx: ctxLight,
        value: -500,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 140,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctxLight.fillStyle).toBe('#DC2626');

      const ctxDark = createMockContext();
      paintCurrency({
        ctx: ctxDark,
        value: -500,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 140,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctxDark.fillStyle).toBe('#FF453A');
    });

    it('should respect custom currencySymbol and decimalDigits', () => {
      const ctx = createMockContext();
      paintCurrency({
        ctx,
        value: 1250,
        column: { ...defaultColumn, currencySymbol: '€', decimalDigits: 0 },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 140,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('1.250 €', expect.any(Number), expect.any(Number));
    });

    it('should not throw or render on null, undefined, or NaN values', () => {
      const ctx = createMockContext();
      expect(() => {
        paintCurrency({
          ctx,
          value: null as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 140,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
          locale: trTR,
        });
        paintCurrency({
          ctx,
          value: 'invalid' as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 140,
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
