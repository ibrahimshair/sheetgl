// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { BooleanColumnPlugin } from '../../src/datagrid/columns/types/BooleanColumn/index';
import { paintBoolean } from '../../src/datagrid/columns/types/BooleanColumn/BooleanPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('BooleanColumnPlugin & BooleanPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'active',
    title: 'Aktif',
    width: 80,
    type: 'boolean',
  };

  describe('Plugin Definition', () => {
    it('should have correct plugin properties and zero-DOM editor', () => {
      expect(BooleanColumnPlugin.type).toBe('boolean');
      expect(BooleanColumnPlugin.editorComponent).toBeUndefined();
      expect(BooleanColumnPlugin.paint).toBe(paintBoolean);
    });
  });

  describe('onPointerDown', () => {
    it('should toggle boolean value from false to true', () => {
      const setValue = vi.fn();
      const result = BooleanColumnPlugin.onPointerDown?.({
        localX: 40,
        localY: 17,
        value: false,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: true });
      expect(setValue).toHaveBeenCalledWith(true);
    });

    it('should toggle boolean value from true to false', () => {
      const setValue = vi.fn();
      const result = BooleanColumnPlugin.onPointerDown?.({
        localX: 40,
        localY: 17,
        value: true,
        setValue,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(result).toEqual({ handled: true });
      expect(setValue).toHaveBeenCalledWith(false);
    });
  });

  describe('onKeyDown', () => {
    it('should toggle value on space key and prevent default', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();

      const handled = BooleanColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        value: false,
        setValue,
        openEditor: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(true);
    });

    it('should toggle true to false on space key', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();

      const handled = BooleanColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        value: true,
        setValue,
        openEditor: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(false);
    });

    it('should ignore other keys', () => {
      const setValue = vi.fn();
      const preventDefault = vi.fn();

      const handled = BooleanColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        value: false,
        setValue,
        openEditor: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
      });

      expect(handled).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should recognize affirmative string representations as true', () => {
      expect(BooleanColumnPlugin.parseClipboard?.('true', defaultColumn)).toBe(true);
      expect(BooleanColumnPlugin.parseClipboard?.('1', defaultColumn)).toBe(true);
      expect(BooleanColumnPlugin.parseClipboard?.('evet', defaultColumn)).toBe(true);
      expect(BooleanColumnPlugin.parseClipboard?.('aktif', defaultColumn)).toBe(true);
      expect(BooleanColumnPlugin.parseClipboard?.('yes', defaultColumn)).toBe(true);
      expect(BooleanColumnPlugin.parseClipboard?.(' TRUE ', defaultColumn)).toBe(true);
      expect(BooleanColumnPlugin.parseClipboard?.(' Evet ', defaultColumn)).toBe(true);
    });

    it('should parse everything else as false', () => {
      expect(BooleanColumnPlugin.parseClipboard?.('false', defaultColumn)).toBe(false);
      expect(BooleanColumnPlugin.parseClipboard?.('0', defaultColumn)).toBe(false);
      expect(BooleanColumnPlugin.parseClipboard?.('hayır', defaultColumn)).toBe(false);
      expect(BooleanColumnPlugin.parseClipboard?.('pasif', defaultColumn)).toBe(false);
      expect(BooleanColumnPlugin.parseClipboard?.('no', defaultColumn)).toBe(false);
      expect(BooleanColumnPlugin.parseClipboard?.('', defaultColumn)).toBe(false);
      expect(BooleanColumnPlugin.parseClipboard?.('random text', defaultColumn)).toBe(false);
    });
  });

  describe('formatClipboard', () => {
    it('should format true as DOĞRU and false as YANLIŞ', () => {
      expect(BooleanColumnPlugin.formatClipboard?.(true, defaultColumn)).toBe('DOĞRU');
      expect(BooleanColumnPlugin.formatClipboard?.(false, defaultColumn)).toBe('YANLIŞ');
      expect(BooleanColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('YANLIŞ');
    });
  });

  describe('comparator', () => {
    it('should correctly sort booleans (false before true)', () => {
      expect(BooleanColumnPlugin.comparator?.(true, true)).toBe(0);
      expect(BooleanColumnPlugin.comparator?.(false, false)).toBe(0);
      expect(BooleanColumnPlugin.comparator?.(true, false)).toBe(1);
      expect(BooleanColumnPlugin.comparator?.(false, true)).toBe(-1);
    });
  });

  describe('paintBoolean (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        lineWidth: 0,
        fillStyle: '',
        strokeStyle: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render checked state with checkmark lines in light mode', () => {
      const ctx = createMockContext();
      paintBoolean({
        ctx,
        value: true,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 10,
        y: 5,
        width: 80,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.lineWidth).toBe(1.5);
      expect(ctx.fillStyle).toBe(appleLight.canvas.selectionBorder);

      // Centered box: boxX = 10 + (80 - 16)/2 = 42, boxY = 5 + (34 - 16)/2 = 14
      expect(ctx.roundRect).toHaveBeenCalledWith(42, 14, 16, 16, 3);
      expect(ctx.fill).toHaveBeenCalled();

      // Checkmark stroke
      expect(ctx.strokeStyle).toBe('#FFFFFF');
      expect(ctx.moveTo).toHaveBeenCalledWith(42 + 3.5, 14 + 8);
      expect(ctx.lineTo).toHaveBeenCalledWith(42 + 6.5, 14 + 11.5);
      expect(ctx.lineTo).toHaveBeenCalledWith(42 + 12.5, 14 + 4.5);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should render unchecked state without checkmark in dark mode', () => {
      const ctx = createMockContext();
      paintBoolean({
        ctx,
        value: false,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.strokeStyle).toBe('#5A5A5E');
      expect(ctx.fillStyle).toBe(appleDark.canvas.bg);

      // Centered box: boxX = 0 + (100 - 16)/2 = 42, boxY = 0 + (40 - 16)/2 = 12
      expect(ctx.roundRect).toHaveBeenCalledWith(42, 12, 16, 16, 3);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.moveTo).not.toHaveBeenCalled();
    });

    it('should render unchecked border in light mode as #C7C7CC', () => {
      const ctx = createMockContext();
      paintBoolean({
        ctx,
        value: false,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.strokeStyle).toBe('#C7C7CC');
      expect(ctx.fillStyle).toBe(appleLight.canvas.bg);
      expect(ctx.moveTo).not.toHaveBeenCalled();
    });
  });
});
