// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ProgressColumnPlugin } from '../../src/datagrid/columns/types/ProgressColumn/index';
import { paintProgress } from '../../src/datagrid/columns/types/ProgressColumn/ProgressPainter';
import { NumberEditor } from '../../src/datagrid/columns/types/NumberColumn/NumberEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('ProgressColumnPlugin & ProgressPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'progress',
    title: 'İlerleme',
    width: 140,
    type: 'progress',
  };

  describe('Plugin Definition', () => {
    it('should have type progress, NumberEditor and paintProgress', () => {
      expect(ProgressColumnPlugin.type).toBe('progress');
      expect(ProgressColumnPlugin.editorComponent).toBe(NumberEditor);
      expect(ProgressColumnPlugin.paint).toBe(paintProgress);
    });
  });

  describe('onKeyDown', () => {
    it('should open editor when digit key is pressed', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = ProgressColumnPlugin.onKeyDown?.({
        event: { key: '7', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 50,
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('7');
    });

    it('should not open editor on modifiers or non-digit keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const ctrlHandled = ProgressColumnPlugin.onKeyDown?.({
        event: { key: '7', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 50,
      });
      expect(ctrlHandled).toBe(false);

      const letterHandled = ProgressColumnPlugin.onKeyDown?.({
        event: { key: 'a', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 50,
      });
      expect(letterHandled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should parse percentage strings and clean numbers', () => {
      expect(ProgressColumnPlugin.parseClipboard?.('75%', defaultColumn)).toBe(75);
      expect(ProgressColumnPlugin.parseClipboard?.(' 42 ', defaultColumn)).toBe(42);
      expect(ProgressColumnPlugin.parseClipboard?.('%80', defaultColumn)).toBe(80);
    });

    it('should clamp values above 100 to 100', () => {
      expect(ProgressColumnPlugin.parseClipboard?.('150%', defaultColumn)).toBe(100);
    });

    it('should clamp negative values to 0', () => {
      expect(ProgressColumnPlugin.parseClipboard?.('-25%', defaultColumn)).toBe(0);
    });

    it('should return 0 for unparseable strings', () => {
      expect(ProgressColumnPlugin.parseClipboard?.('tamamlandı', defaultColumn)).toBe(0);
      expect(ProgressColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(0);
    });
  });

  describe('formatClipboard', () => {
    it('should format percentage with % suffix', () => {
      expect(ProgressColumnPlugin.formatClipboard?.(85, defaultColumn)).toBe('85%');
      expect(ProgressColumnPlugin.formatClipboard?.(0, defaultColumn)).toBe('0%');
      expect(ProgressColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('0%');
    });
  });

  describe('comparator', () => {
    it('should correctly sort progress ascending', () => {
      expect(ProgressColumnPlugin.comparator?.(20, 80)).toBeLessThan(0);
      expect(ProgressColumnPlugin.comparator?.(90, 30)).toBeGreaterThan(0);
      expect(ProgressColumnPlugin.comparator?.(50, 50)).toBe(0);
      expect(ProgressColumnPlugin.comparator?.(null as any, 10)).toBe(-10);
    });
  });

  describe('paintProgress (Canvas 2D Rendering)', () => {
    function createMockContext() {
      const fillStyles: string[] = [];
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
        get fillStyle() {
          return fillStyles[fillStyles.length - 1] || '';
        },
        set fillStyle(val: string) {
          fillStyles.push(val);
        },
        _recordedFills: fillStyles,
      } as unknown as CanvasRenderingContext2D & { _recordedFills: string[] };
    }

    it('should render track, fill bar, and TR % prefix text for 60% progress', () => {
      const ctx = createMockContext();
      paintProgress({
        ctx,
        value: 60,
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

      // Track: pad=6, barTotalW = 140 - 12 = 128, barH = 18, barY = (34 - 18)/2 = 8
      expect(ctx.roundRect).toHaveBeenCalledWith(6, 8, 128, 18, 4);

      // Fill: 60% of 128 = 76.8
      expect(ctx.roundRect).toHaveBeenCalledWith(6, 8, 76.8, 18, 4);

      // Fills: track color (#E5E5EA in light), bar fill color (selectionBorder), text color (#FFFFFF since pct > 55)
      expect(ctx._recordedFills[0]).toBe('#E5E5EA');
      expect(ctx._recordedFills[1]).toBe(appleLight.canvas.selectionBorder);
      expect(ctx._recordedFills[2]).toBe('#FFFFFF');

      // Turkish locale puts % first
      expect(ctx.fillText).toHaveBeenCalledWith('%60', 70, 17);
    });

    it('should render emerald green #10B981 fill when 100% completed', () => {
      const ctx = createMockContext();
      paintProgress({
        ctx,
        value: 100,
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

      expect(ctx._recordedFills[1]).toBe('#10B981');
      expect(ctx.fillText).toHaveBeenCalledWith('%100', 70, 17);
    });

    it('should render EN suffix text ("30%") and dark text color for <= 55% progress', () => {
      const ctx = createMockContext();
      paintProgress({
        ctx,
        value: 30,
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
        locale: enUS,
      });

      // <= 55% uses cellText color
      expect(ctx._recordedFills[2]).toBe(appleLight.canvas.cellText);
      expect(ctx.fillText).toHaveBeenCalledWith('30%', 70, 17);
    });

    it('should render dark mode track color #2C2C2E', () => {
      const ctx = createMockContext();
      paintProgress({
        ctx,
        value: 0,
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

      // When pct == 0, fillW is 0, so only track is filled
      expect(ctx.roundRect).toHaveBeenCalledTimes(1);
      expect(ctx._recordedFills[0]).toBe('#2C2C2E');
      expect(ctx.fillText).toHaveBeenCalledWith('%0', 70, 17);
    });
  });
});
