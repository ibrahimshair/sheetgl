// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { SparklineColumnPlugin } from '../../src/datagrid/columns/types/SparklineColumn/index';
import { paintSparkline } from '../../src/datagrid/columns/types/SparklineColumn/SparklinePainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('SparklineColumnPlugin & SparklinePainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'trend',
    title: 'Trend',
    width: 150,
    type: 'sparkline',
  };

  describe('Plugin Definition', () => {
    it('should have correct type and read-only editorComponent', () => {
      expect(SparklineColumnPlugin.type).toBe('sparkline');
      expect(SparklineColumnPlugin.editorComponent).toBeUndefined();
      expect(SparklineColumnPlugin.paint).toBe(paintSparkline);
    });
  });

  describe('parseClipboard', () => {
    it('should parse comma-separated numbers into an array', () => {
      expect(SparklineColumnPlugin.parseClipboard?.('10, 20, 30', defaultColumn)).toEqual([10, 20, 30]);
      expect(SparklineColumnPlugin.parseClipboard?.(' 5.5 , 12.8 , 99 ', defaultColumn)).toEqual([5.5, 12.8, 99]);
    });

    it('should filter out non-numeric tokens', () => {
      expect(SparklineColumnPlugin.parseClipboard?.('10, foo, 25, bar, 40', defaultColumn)).toEqual([10, 25, 40]);
      expect(SparklineColumnPlugin.parseClipboard?.('invalid, data', defaultColumn)).toEqual([]);
    });

    it('should handle empty input', () => {
      expect(SparklineColumnPlugin.parseClipboard?.('', defaultColumn)).toEqual([]);
    });
  });

  describe('formatClipboard', () => {
    it('should format number array as comma-separated string', () => {
      expect(SparklineColumnPlugin.formatClipboard?.([10, 20, 30], defaultColumn)).toBe('10,20,30');
    });

    it('should return empty string for non-array values', () => {
      expect(SparklineColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(SparklineColumnPlugin.formatClipboard?.('not-an-array' as any, defaultColumn)).toBe('');
    });
  });

  describe('paintSparkline (Canvas 2D Trendline Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        lineWidth: 0,
        lineJoin: '',
        lineCap: '',
        strokeStyle: '',
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should not render anything if points array has fewer than 2 items', () => {
      const ctx = createMockContext();
      paintSparkline({
        ctx,
        value: [42],
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 150,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('should render sparkline with moveTo and lineTo for valid points', () => {
      const ctx = createMockContext();
      const points = [10, 25, 15, 30, 20];

      paintSparkline({
        ctx,
        value: points,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 150,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.clip).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledTimes(1);
      // 4 subsequent points
      expect(ctx.lineTo).toHaveBeenCalledTimes(4);
      expect(ctx.stroke).toHaveBeenCalled();

      // Dot at the end of the line
      expect(ctx.arc).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 2.5, 0, Math.PI * 2);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should use custom sparklineColor from column definition if provided', () => {
      const ctx = createMockContext();
      const customColumn: ColumnDef = {
        ...defaultColumn,
        sparklineColor: '#10B981',
      };

      paintSparkline({
        ctx,
        value: [5, 10, 15],
        column: customColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 150,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.strokeStyle).toBe('#10B981');
    });

    it('should render detail modal trigger icon (↗) when cell isHovered or isSelected', () => {
      const ctx = createMockContext();
      paintSparkline({
        ctx,
        value: [10, 20, 30],
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 150,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('↗', expect.any(Number), expect.any(Number));
    });

    it('should render detail modal trigger icon (↗) when cell isSelected in dark mode', () => {
      const ctx = createMockContext();
      paintSparkline({
        ctx,
        value: [10, 20, 30],
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 150,
        height: 34,
        isHovered: false,
        isSelected: true,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('↗', expect.any(Number), expect.any(Number));
    });

    it('should not render if width or height is zero or negative', () => {
      const ctx = createMockContext();
      paintSparkline({
        ctx,
        value: [10, 20, 30],
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 10, // width 10 minus padX(8) - rightReserve(10) < 0
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).not.toHaveBeenCalled();
    });
  });
});
