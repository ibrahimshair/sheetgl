// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ColorColumnPlugin, paintColor } from '../../src/datagrid/columns/types/ColorColumn/index';
import { ColorEditor } from '../../src/datagrid/columns/types/ColorColumn/ColorEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('ColorColumnPlugin & paintColor', () => {
  const defaultColumn: ColumnDef = {
    id: 'color',
    title: 'Renk',
    width: 140,
    type: 'color',
  };

  describe('Plugin Definition', () => {
    it('should have type color, ColorEditor and paintColor', () => {
      expect(ColorColumnPlugin.type).toBe('color');
      expect(ColorColumnPlugin.editorComponent).toBe(ColorEditor);
      expect(ColorColumnPlugin.paint).toBe(paintColor);
    });
  });

  describe('onPointerDown', () => {
    it('should open editor on click', () => {
      const result = ColorColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 17,
        value: '#38BDF8',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor when Space or Enter is pressed', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const spaceHandled = ColorColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '#38BDF8',
      });
      expect(spaceHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalled();

      openEditor.mockClear();
      preventDefault.mockClear();

      const enterHandled = ColorColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '#38BDF8',
      });
      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalled();
    });

    it('should ignore other keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = ColorColumnPlugin.onKeyDown?.({
        event: { key: 'ArrowDown', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '#38BDF8',
      });
      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim string on parseClipboard', () => {
      expect(ColorColumnPlugin.parseClipboard?.('  #10B981  ', defaultColumn)).toBe('#10B981');
    });

    it('should format clipboard with fallback default', () => {
      expect(ColorColumnPlugin.formatClipboard?.('#EF4444', defaultColumn)).toBe('#EF4444');
      expect(ColorColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('#38BDF8');
    });
  });

  describe('comparator', () => {
    it('should compare hex color codes alphabetically', () => {
      expect(ColorColumnPlugin.comparator?.('#10B981', '#38BDF8')).toBeLessThan(0);
      expect(ColorColumnPlugin.comparator?.('#38BDF8', '#10B981')).toBeGreaterThan(0);
      expect(ColorColumnPlugin.comparator?.('#10B981', '#10B981')).toBe(0);
    });
  });

  describe('paintColor (Canvas 2D Swatch and Hex Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render color swatch box and uppercase hex text', () => {
      const ctx = createMockContext();
      paintColor({
        ctx,
        value: '#10b981',
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
      expect(ctx.clip).toHaveBeenCalled();

      // Swatch box: swatchSize=16, x=8, swatchY = 17 - 8 = 9
      expect(ctx.roundRect).toHaveBeenCalledWith(8, 9, 16, 16, 4);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();

      // Text: uppercase #10B981 at 8 + 16 + 8 = 32
      expect(ctx.fillText).toHaveBeenCalledWith('#10B981', 32, 17);
    });

    it('should use default fallback #38BDF8 if value is empty', () => {
      const ctx = createMockContext();
      paintColor({
        ctx,
        value: '',
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

      expect(ctx.fillText).toHaveBeenCalledWith('#38BDF8', 32, 17);
    });
  });
});
