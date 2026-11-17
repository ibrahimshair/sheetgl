// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { DropdownButtonColumnPlugin } from '../../src/datagrid/columns/types/DropdownButtonColumn';
import { paintDropdownButton } from '../../src/datagrid/columns/types/DropdownButtonColumn/DropdownButtonPainter';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';

describe('DropdownButtonColumnPlugin', () => {
  const defaultColumn: ColumnDef = {
    id: 'actions',
    title: 'Actions',
    type: 'dropdownbutton',
    width: 120,
  };

  it('should have correct plugin metadata', () => {
    expect(DropdownButtonColumnPlugin.type).toBe('dropdownbutton');
    expect(DropdownButtonColumnPlugin.paint).toBe(paintDropdownButton);
  });

  describe('onPointerDown', () => {
    it('should return handled: true when column has actionMenuItems', () => {
      const colWithMenu: ColumnDef = {
        ...defaultColumn,
        actionMenuItems: [{ id: 'edit', label: 'Edit' }],
      };

      const result = DropdownButtonColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: null,
        column: colWithMenu,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true });
    });

    it('should return handled: true when column has options', () => {
      const colWithOptions: ColumnDef = {
        ...defaultColumn,
        options: [{ value: 'opt1', label: 'Opt 1' }, { value: 'opt2', label: 'Opt 2' }],
      };

      const result = DropdownButtonColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: null,
        column: colWithOptions,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true });
    });

    it('should trigger onActionClick and return handled: true when provided', () => {
      const onActionClick = vi.fn();
      const colWithAction: ColumnDef = {
        ...defaultColumn,
        onActionClick,
      };

      const row = { id: 101, name: 'Item' };
      const result = DropdownButtonColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: 'btnValue',
        row,
        rowIndex: 3,
        column: colWithAction,
        setValue: vi.fn(),
      });

      expect(onActionClick).toHaveBeenCalledWith(row, 3);
      expect(result).toEqual({ handled: true });
    });

    it('should fallback to value if row is undefined in onActionClick', () => {
      const onActionClick = vi.fn();
      const colWithAction: ColumnDef = {
        ...defaultColumn,
        onActionClick,
      };

      DropdownButtonColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: 'standaloneVal',
        column: colWithAction,
        setValue: vi.fn(),
      });

      expect(onActionClick).toHaveBeenCalledWith('standaloneVal', 0);
    });

    it('should return handled: false when no menu, options, or onActionClick are defined', () => {
      const result = DropdownButtonColumnPlugin.onPointerDown?.({
        localX: 20,
        localY: 10,
        value: null,
        column: defaultColumn,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should handle Enter key with actionMenuItems', () => {
      const preventDefault = vi.fn();
      const event = { key: 'Enter', preventDefault } as unknown as React.KeyboardEvent;
      const col: ColumnDef = { ...defaultColumn, actionMenuItems: [{ id: 'delete', label: 'Delete' }] };

      const handled = DropdownButtonColumnPlugin.onKeyDown?.({
        event,
        value: null,
        column: col,
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(handled).toBe(true);
    });

    it('should handle Space key with onActionClick', () => {
      const preventDefault = vi.fn();
      const onActionClick = vi.fn();
      const event = { key: ' ', preventDefault } as unknown as React.KeyboardEvent;
      const col: ColumnDef = { ...defaultColumn, onActionClick };
      const row = { id: 5 };

      const handled = DropdownButtonColumnPlugin.onKeyDown?.({
        event,
        value: 'btn',
        row,
        rowIndex: 2,
        column: col,
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(onActionClick).toHaveBeenCalledWith(row, 2);
      expect(handled).toBe(true);
    });

    it('should return false for unhandled keys like Tab or Escape', () => {
      const preventDefault = vi.fn();
      const event = { key: 'Escape', preventDefault } as unknown as React.KeyboardEvent;

      const handled = DropdownButtonColumnPlugin.onKeyDown?.({
        event,
        value: null,
        column: defaultColumn,
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(preventDefault).not.toHaveBeenCalled();
      expect(handled).toBe(false);
    });
  });

  describe('formatClipboard', () => {
    it('should return string value when value is a non-empty string', () => {
      expect(DropdownButtonColumnPlugin.formatClipboard?.('Custom Action', defaultColumn)).toBe('Custom Action');
    });

    it('should return object.label when value is an object with label', () => {
      expect(DropdownButtonColumnPlugin.formatClipboard?.({ label: 'Download PDF', id: 'pdf' }, defaultColumn)).toBe('Download PDF');
    });

    it('should fallback to column.buttonText if value is empty', () => {
      const col: ColumnDef = { ...defaultColumn, buttonText: 'Click Me' };
      expect(DropdownButtonColumnPlugin.formatClipboard?.('', col)).toBe('Click Me');
      expect(DropdownButtonColumnPlugin.formatClipboard?.(null, col)).toBe('Click Me');
    });

    it('should fallback to column.title or empty string if no buttonText', () => {
      expect(DropdownButtonColumnPlugin.formatClipboard?.(null, defaultColumn)).toBe('Actions');
      const emptyCol: ColumnDef = { id: 'x', title: '', type: 'dropdownbutton', width: 100 };
      expect(DropdownButtonColumnPlugin.formatClipboard?.(null, emptyCol)).toBe('');
    });
  });

  describe('paintDropdownButton (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        measureText: vi.fn((text: string) => ({
          width: text.length * 7,
        } as TextMetrics)),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
        lineCap: '',
        lineJoin: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should return early without drawing if width is too narrow', () => {
      const ctx = createMockContext();
      paintDropdownButton({
        ctx,
        value: null,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 0,
        y: 0,
        width: 15, // width - padX * 2 <= 10
        height: 30,
        isSelected: false,
        isHovered: false,
      });

      expect(ctx.save).not.toHaveBeenCalled();
    });

    it('should paint dropdown button in light theme with rounded rect and chevron', () => {
      const ctx = createMockContext();
      paintDropdownButton({
        ctx,
        value: 'Export',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        isSelected: false,
        isHovered: false,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Export'), expect.any(Number), expect.any(Number));
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should paint in dark theme and hovered state with selectionBorder border', () => {
      const ctx = createMockContext();
      paintDropdownButton({
        ctx,
        value: { label: 'Options', icon: 'settings' },
        column: { ...defaultColumn, buttonIcon: 'settings' },
        row: {},
        rowIndex: 0,
        theme: appleDark,
        locale: trTR,
        x: 10,
        y: 5,
        width: 140,
        height: 32,
        isSelected: false,
        isHovered: true,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.strokeStyle).toBe(appleDark.canvas.selectionBorder);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should handle custom buttonText when value is not specified', () => {
      const ctx = createMockContext();
      paintDropdownButton({
        ctx,
        value: null,
        column: { ...defaultColumn, buttonText: 'Open Menu' },
        row: {},
        rowIndex: 0,
        theme: appleLight,
        locale: trTR,
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        isSelected: true,
        isHovered: false,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Open Menu'), expect.any(Number), expect.any(Number));
      expect(ctx.restore).toHaveBeenCalled();
    });
  });
});
