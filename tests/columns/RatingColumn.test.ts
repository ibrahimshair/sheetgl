// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { RatingColumnPlugin } from '../../src/datagrid/columns/types/RatingColumn/index';
import { paintRating } from '../../src/datagrid/columns/types/RatingColumn/RatingPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('RatingColumnPlugin & RatingPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'rating',
    title: 'Puan',
    width: 120,
    type: 'rating',
  };

  describe('Plugin Definition', () => {
    it('should have correct type and zero-DOM configuration', () => {
      expect(RatingColumnPlugin.type).toBe('rating');
      expect(RatingColumnPlugin.editorComponent).toBeUndefined();
      expect(RatingColumnPlugin.paint).toBe(paintRating);
    });
  });

  describe('onPointerDown (Direct Star Clicking)', () => {
    it('should set rating 1 when clicking first star', () => {
      const setValue = vi.fn();
      const result = RatingColumnPlugin.onPointerDown?.({
        localX: 15,
        localY: 17,
        value: 0,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: true });
      expect(setValue).toHaveBeenCalledWith(1);
    });

    it('should set rating 3 when clicking third star', () => {
      const setValue = vi.fn();
      // startX=8, star 3 is between 8 + 2*16 = 40 and 40 + 16 = 56
      const result = RatingColumnPlugin.onPointerDown?.({
        localX: 45,
        localY: 17,
        value: 1,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: true });
      expect(setValue).toHaveBeenCalledWith(3);
    });

    it('should set rating 5 when clicking fifth star', () => {
      const setValue = vi.fn();
      // startX=8, star 5 is between 8 + 4*16 = 72 and 88
      const result = RatingColumnPlugin.onPointerDown?.({
        localX: 80,
        localY: 17,
        value: 2,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: true });
      expect(setValue).toHaveBeenCalledWith(5);
    });

    it('should ignore clicks to the left of the first star (localX <= 8)', () => {
      const setValue = vi.fn();
      const result = RatingColumnPlugin.onPointerDown?.({
        localX: 5,
        localY: 17,
        value: 3,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: false });
      expect(setValue).not.toHaveBeenCalled();
    });

    it('should ignore clicks beyond the fifth star (localX > 88)', () => {
      const setValue = vi.fn();
      const result = RatingColumnPlugin.onPointerDown?.({
        localX: 100,
        localY: 17,
        value: 3,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: false });
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown (Numeric 1-5 direct rating keys)', () => {
    it.each([1, 2, 3, 4, 5])('should set rating %i when key "%i" is pressed', (num) => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();

      const handled = RatingColumnPlugin.onKeyDown?.({
        event: { key: String(num), preventDefault } as any,
        setValue,
        openEditor: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 0,
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(num);
    });

    it('should ignore other keys (0, 6, letters, Enter)', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();

      ['0', '6', '9', 'a', 'Enter', ' '].forEach((key) => {
        const handled = RatingColumnPlugin.onKeyDown?.({
          event: { key, preventDefault } as any,
          setValue,
          openEditor: vi.fn(),
          column: defaultColumn,
          row: {},
          rowIndex: 0,
          value: 3,
        });

        expect(handled).toBe(false);
        expect(preventDefault).not.toHaveBeenCalled();
        expect(setValue).not.toHaveBeenCalled();
      });
    });
  });

  describe('parseClipboard', () => {
    it('should parse valid numbers between 0 and 5', () => {
      expect(RatingColumnPlugin.parseClipboard?.('0', defaultColumn)).toBe(0);
      expect(RatingColumnPlugin.parseClipboard?.('3', defaultColumn)).toBe(3);
      expect(RatingColumnPlugin.parseClipboard?.(' 5 ', defaultColumn)).toBe(5);
    });

    it('should clamp numbers higher than 5 to 5', () => {
      expect(RatingColumnPlugin.parseClipboard?.('10', defaultColumn)).toBe(5);
    });

    it('should clamp negative numbers to 0', () => {
      expect(RatingColumnPlugin.parseClipboard?.('-4', defaultColumn)).toBe(0);
    });

    it('should return 0 for non-numeric clipboard text', () => {
      expect(RatingColumnPlugin.parseClipboard?.('invalid', defaultColumn)).toBe(0);
      expect(RatingColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(0);
    });
  });

  describe('formatClipboard', () => {
    it('should format rating as "N / 5 Yıldız"', () => {
      expect(RatingColumnPlugin.formatClipboard?.(4, defaultColumn)).toBe('4 / 5 Yıldız');
      expect(RatingColumnPlugin.formatClipboard?.(0, defaultColumn)).toBe('0 / 5 Yıldız');
      expect(RatingColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('0 / 5 Yıldız');
    });
  });

  describe('comparator', () => {
    it('should compare rating numbers ascending', () => {
      expect(RatingColumnPlugin.comparator?.(3, 5)).toBeLessThan(0);
      expect(RatingColumnPlugin.comparator?.(4, 2)).toBeGreaterThan(0);
      expect(RatingColumnPlugin.comparator?.(4, 4)).toBe(0);
    });

    it('should handle undefined or null values as 0', () => {
      expect(RatingColumnPlugin.comparator?.(undefined as any, 2)).toBe(-2);
      expect(RatingColumnPlugin.comparator?.(null as any, null as any)).toBe(0);
    });
  });

  describe('paintRating (Canvas 2D Vector Stars)', () => {
    function createMockContext() {
      const fillStyles: string[] = [];
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        get fillStyle() {
          return fillStyles[fillStyles.length - 1] || '';
        },
        set fillStyle(val: string) {
          fillStyles.push(val);
        },
        _recordedFills: fillStyles,
      } as unknown as CanvasRenderingContext2D & { _recordedFills: string[] };
    }

    it('should render 3 filled stars (#F59E0B) and 2 empty stars in light mode for rating 3', () => {
      const ctx = createMockContext();
      paintRating({
        ctx,
        value: 3,
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
      expect(ctx.fill).toHaveBeenCalledTimes(5);
      expect(ctx.closePath).toHaveBeenCalledTimes(5);

      // 3 filled (#F59E0B), 2 empty (#D1D1D6 in light mode)
      expect(ctx._recordedFills).toEqual([
        '#F59E0B',
        '#F59E0B',
        '#F59E0B',
        '#D1D1D6',
        '#D1D1D6',
      ]);
    });

    it('should render empty stars in dark mode with #48484A', () => {
      const ctx = createMockContext();
      paintRating({
        ctx,
        value: 1,
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

      expect(ctx._recordedFills).toEqual([
        '#F59E0B',
        '#48484A',
        '#48484A',
        '#48484A',
        '#48484A',
      ]);
    });

    it('should clamp value: negative to 0 and above 5 to 5', () => {
      const ctx0 = createMockContext();
      paintRating({
        ctx: ctx0,
        value: -2,
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
      expect(ctx0._recordedFills).toEqual([
        '#D1D1D6',
        '#D1D1D6',
        '#D1D1D6',
        '#D1D1D6',
        '#D1D1D6',
      ]);

      const ctx5 = createMockContext();
      paintRating({
        ctx: ctx5,
        value: 9,
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
      expect(ctx5._recordedFills).toEqual([
        '#F59E0B',
        '#F59E0B',
        '#F59E0B',
        '#F59E0B',
        '#F59E0B',
      ]);
    });

    it('should stop rendering stars when column width is too narrow', () => {
      const ctx = createMockContext();
      // startX=8, star 0: sx=8 (sx+13=21 <= 40)
      // star 1: sx=8+16=24 (sx+13=37 <= 40)
      // star 2: sx=8+32=40 (sx+13=53 > 40) -> breaks!
      paintRating({
        ctx,
        value: 5,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 40,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.fill).toHaveBeenCalledTimes(2);
    });
  });
});
