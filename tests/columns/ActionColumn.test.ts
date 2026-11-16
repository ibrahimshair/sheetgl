// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ActionColumnPlugin } from '../../src/datagrid/columns/types/ActionColumn/index';
import { paintAction } from '../../src/datagrid/columns/types/ActionColumn/ActionPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('ActionColumnPlugin & paintAction', () => {
  const defaultColumn: ColumnDef = {
    id: 'actions',
    title: 'İşlemler',
    width: 90,
    type: 'action',
  };

  describe('Plugin Definition', () => {
    it('should have type action and paintAction', () => {
      expect(ActionColumnPlugin.type).toBe('action');
      expect(ActionColumnPlugin.paint).toBe(paintAction);
    });
  });

  describe('onPointerDown', () => {
    it('should invoke onActionClick with row and rowIndex when configured', () => {
      const onActionClick = vi.fn();
      const colWithAction: ColumnDef = {
        ...defaultColumn,
        onActionClick,
      };

      const row = { id: 101, name: 'Sample Item' };
      const result = ActionColumnPlugin.onPointerDown?.({
        localX: 45,
        localY: 17,
        column: colWithAction,
        row,
        rowIndex: 3,
        value: 101,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true });
      expect(onActionClick).toHaveBeenCalledWith(row, 3);
    });

    it('should fallback to value if row is undefined', () => {
      const onActionClick = vi.fn();
      const colWithAction: ColumnDef = {
        ...defaultColumn,
        onActionClick,
      };

      const result = ActionColumnPlugin.onPointerDown?.({
        localX: 45,
        localY: 17,
        column: colWithAction,
        row: undefined,
        rowIndex: 0,
        value: 'item-99',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true });
      expect(onActionClick).toHaveBeenCalledWith('item-99', 0);
    });

    it('should return handled: false when onActionClick is not provided', () => {
      const result = ActionColumnPlugin.onPointerDown?.({
        localX: 45,
        localY: 17,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: null,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should trigger onActionClick on Enter key', () => {
      const onActionClick = vi.fn();
      const preventDefault = vi.fn();
      const colWithAction: ColumnDef = {
        ...defaultColumn,
        onActionClick,
      };

      const row = { id: 202 };
      const handled = ActionColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        column: colWithAction,
        row,
        rowIndex: 5,
        value: 202,
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(onActionClick).toHaveBeenCalledWith(row, 5);
    });

    it('should ignore other keys', () => {
      const onActionClick = vi.fn();
      const preventDefault = vi.fn();
      const colWithAction: ColumnDef = {
        ...defaultColumn,
        onActionClick,
      };

      const handled = ActionColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        column: colWithAction,
        row: {},
        rowIndex: 0,
        value: 1,
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(handled).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onActionClick).not.toHaveBeenCalled();
    });
  });

  describe('paintAction (Canvas 2D Rendering)', () => {
    function createMockContext() {
      const fillStyles: string[] = [];
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 0,
        strokeStyle: '',
        get fillStyle() {
          return fillStyles[fillStyles.length - 1] || '';
        },
        set fillStyle(val: string) {
          fillStyles.push(val);
        },
        _recordedFills: fillStyles,
      } as unknown as CanvasRenderingContext2D & { _recordedFills: string[] };
    }

    it('should render icon-only button with default settings icon', () => {
      const ctx = createMockContext();
      paintAction({
        ctx,
        value: null,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 90,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();

      // Icon ligature for settings
      expect(ctx.font).toContain('Material Symbols');
      expect(ctx.fillText).toHaveBeenCalledWith('settings', expect.any(Number), expect.any(Number));
    });

    it('should render custom text button label with theme font', () => {
      const ctx = createMockContext();
      paintAction({
        ctx,
        value: null,
        column: { ...defaultColumn, buttonText: 'Detay' },
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

      expect(ctx.font).toContain(appleLight.fontFamily);
      expect(ctx.fillText).toHaveBeenCalledWith('Detay', expect.any(Number), expect.any(Number));
    });

    it('should render hover state with selectionBorder and white text', () => {
      const ctx = createMockContext();
      paintAction({
        ctx,
        value: null,
        column: { ...defaultColumn, buttonText: 'Sil' },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      // Hover background fill
      expect(ctx._recordedFills[0]).toBe(appleLight.canvas.selectionBorder);
      // Hover text color
      expect(ctx._recordedFills[1]).toBe('#FFFFFF');
    });

    it('should render dark mode button background (#2C2C2E)', () => {
      const ctx = createMockContext();
      paintAction({
        ctx,
        value: null,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 90,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx._recordedFills[0]).toBe('#2C2C2E');
      expect(ctx.strokeStyle).toBe('#3A3A3C');
    });

    it('should not render anything if column width is too narrow (btnW <= 4 for icon)', () => {
      const ctx = createMockContext();
      paintAction({
        ctx,
        value: null,
        column: defaultColumn, // isIconOnly
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 8, // 8 - 4 = 4 <= 4 -> returns early
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
