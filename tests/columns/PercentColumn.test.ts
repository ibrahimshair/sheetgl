// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { PercentColumnPlugin, paintPercent } from '../../src/datagrid/columns/types/PercentColumn/index';
import { NumberEditor } from '../../src/datagrid/columns/types/NumberColumn/NumberEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('PercentColumnPlugin & PercentPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'growth',
    title: 'Büyüme',
    width: 130,
    type: 'percent',
  };

  describe('Plugin Definition', () => {
    it('should have correct type and components', () => {
      expect(PercentColumnPlugin.type).toBe('percent');
      expect(PercentColumnPlugin.editorComponent).toBe(NumberEditor);
      expect(PercentColumnPlugin.paint).toBe(paintPercent);
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on numeric, dot, comma, and sign keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const plusHandled = PercentColumnPlugin.onKeyDown?.({
        event: { key: '+', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 15,
      });

      expect(plusHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('+');

      const minusHandled = PercentColumnPlugin.onKeyDown?.({
        event: { key: '-', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 15,
      });

      expect(minusHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith('-');
    });

    it('should ignore keys with modifier keys (ctrl, meta)', () => {
      const openEditor = vi.fn();

      const handled = PercentColumnPlugin.onKeyDown?.({
        event: { key: '5', ctrlKey: true, preventDefault: vi.fn() } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 15,
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should parse percent strings with arrows, signs, and percent symbols', () => {
      expect(PercentColumnPlugin.parseClipboard?.('▲ +14.5%', defaultColumn)).toBe(14.5);
      expect(PercentColumnPlugin.parseClipboard?.('▼ -8.2%', defaultColumn)).toBe(-8.2);
      expect(PercentColumnPlugin.parseClipboard?.('25%', defaultColumn)).toBe(25);
    });

    it('should parse localized comma decimals in percent strings', () => {
      expect(PercentColumnPlugin.parseClipboard?.('% 14,5', defaultColumn)).toBe(14.5);
      expect(PercentColumnPlugin.parseClipboard?.('-7,8%', defaultColumn)).toBe(-7.8);
    });

    it('should fallback to 0 for invalid string', () => {
      expect(PercentColumnPlugin.parseClipboard?.('NaN', defaultColumn)).toBe(0);
      expect(PercentColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(0);
    });
  });

  describe('formatClipboard', () => {
    it('should format number with percent sign', () => {
      expect(PercentColumnPlugin.formatClipboard?.(15.5, defaultColumn)).toBe('15.5%');
      expect(PercentColumnPlugin.formatClipboard?.(-4, defaultColumn)).toBe('-4%');
      expect(PercentColumnPlugin.formatClipboard?.('invalid' as any, defaultColumn)).toBe('0%');
    });
  });

  describe('comparator', () => {
    it('should compare percent values numerically', () => {
      const cmp = PercentColumnPlugin.comparator!;
      expect(cmp(15, 25)).toBeLessThan(0);
      expect(cmp(10, -5)).toBeGreaterThan(0);
      expect(cmp(20, 20)).toBe(0);
    });
  });

  describe('paintPercent (Canvas 2D Rendering)', () => {
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

    it('should render positive percentage with up arrow, plus sign, and green color in light theme', () => {
      const ctx = createMockContext();
      paintPercent({
        ctx,
        value: 14.5,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillStyle).toBe('#059669'); // Emerald green
      expect(ctx.fillText).toHaveBeenCalledWith('▲ +14.5%', expect.any(Number), expect.any(Number));
    });

    it('should render positive percentage with green color in dark theme', () => {
      const ctx = createMockContext();
      paintPercent({
        ctx,
        value: 14.5,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: enUS,
      });

      expect(ctx.fillStyle).toBe('#34D399');
    });

    it('should render negative percentage with down arrow and red color in light and dark themes', () => {
      const ctxLight = createMockContext();
      paintPercent({
        ctx: ctxLight,
        value: -6.2,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctxLight.fillStyle).toBe('#DC2626');
      expect(ctxLight.fillText).toHaveBeenCalledWith('▼ -6.2%', expect.any(Number), expect.any(Number));

      const ctxDark = createMockContext();
      paintPercent({
        ctx: ctxDark,
        value: -6.2,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: enUS,
      });

      expect(ctxDark.fillStyle).toBe('#F87171');
    });

    it('should render zero percent in standard cell text color without arrows', () => {
      const ctx = createMockContext();
      paintPercent({
        ctx,
        value: 0,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.fillStyle).toBe(appleLight.canvas.cellText);
      expect(ctx.fillText).toHaveBeenCalledWith('0.0%', expect.any(Number), expect.any(Number));
    });

    it('should respect showVarianceSign: false and omit arrows and variance colors', () => {
      const ctx = createMockContext();
      paintPercent({
        ctx,
        value: 18.5,
        column: { ...defaultColumn, showVarianceSign: false },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: enUS,
      });

      expect(ctx.fillStyle).toBe(appleLight.canvas.cellText);
      expect(ctx.fillText).toHaveBeenCalledWith('18.5%', expect.any(Number), expect.any(Number));
    });

    it('should respect custom decimalDigits configuration', () => {
      const ctx = createMockContext();
      paintPercent({
        ctx,
        value: 12.345,
        column: { ...defaultColumn, decimalDigits: 2, showVarianceSign: false },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 130,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('12,35%', expect.any(Number), expect.any(Number));
    });

    it('should not throw on null, undefined, or NaN values', () => {
      const ctx = createMockContext();
      expect(() => {
        paintPercent({
          ctx,
          value: null as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 130,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
          locale: enUS,
        });
        paintPercent({
          ctx,
          value: NaN as any,
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          x: 0,
          y: 0,
          width: 130,
          height: 34,
          isHovered: false,
          isSelected: false,
          theme: appleLight,
          locale: enUS,
        });
      }).not.toThrow();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });
});
