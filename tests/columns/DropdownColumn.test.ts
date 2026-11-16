// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { DropdownColumnPlugin } from '../../src/datagrid/columns/types/DropdownColumn/index';
import { paintDropdown } from '../../src/datagrid/columns/types/DropdownColumn/DropdownPainter';
import { SelectEditor } from '../../src/datagrid/columns/types/SelectColumn/SelectEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('DropdownColumnPlugin & paintDropdown', () => {
  const defaultColumn: ColumnDef = {
    id: 'category',
    title: 'Kategori',
    width: 150,
    type: 'dropdown',
    options: [
      { value: 'elec', label: 'Elektronik', fg: '#0284C7', darkFg: '#38BDF8' },
      { value: 'clothing', label: 'Giyim', fg: '#10B981', darkFg: '#34D399' },
      { value: 'food', label: 'Gıda' },
    ],
  };

  describe('Plugin Definition', () => {
    it('should have type dropdown, SelectEditor and paintDropdown', () => {
      expect(DropdownColumnPlugin.type).toBe('dropdown');
      expect(DropdownColumnPlugin.editorComponent).toBe(SelectEditor);
      expect(DropdownColumnPlugin.paint).toBe(paintDropdown);
    });
  });

  describe('onPointerDown', () => {
    it('should open editor when clicking dropdown chevron trigger on right (localX > width - 28)', () => {
      const result = DropdownColumnPlugin.onPointerDown?.({
        localX: 130, // width=150, 150 - 28 = 122
        localY: 17,
        value: 'elec',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should return handled: false when clicking elsewhere on the cell', () => {
      const result = DropdownColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 17,
        value: 'elec',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on character key with that key passed', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = DropdownColumnPlugin.onKeyDown?.({
        event: { key: 'E', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'elec',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('E');
    });

    it('should open editor without argument on Enter', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = DropdownColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'elec',
      });
      expect(enterHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith();
    });

    it('should ignore non-matching keys or shortcut combinations', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = DropdownColumnPlugin.onKeyDown?.({
        event: { key: 'c', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'elec',
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should map clipboard string to matching option value by value or label', () => {
      expect(DropdownColumnPlugin.parseClipboard?.('Elektronik', defaultColumn)).toBe('elec');
      expect(DropdownColumnPlugin.parseClipboard?.('elec', defaultColumn)).toBe('elec');
      expect(DropdownColumnPlugin.parseClipboard?.('"Giyim"', defaultColumn)).toBe('clothing');
    });

    it('should fallback to clean string if no option matches', () => {
      expect(DropdownColumnPlugin.parseClipboard?.('Bilinmeyen', defaultColumn)).toBe('Bilinmeyen');
    });

    it('should return empty string for null or empty input', () => {
      expect(DropdownColumnPlugin.parseClipboard?.(null as any, defaultColumn)).toBe('');
      expect(DropdownColumnPlugin.parseClipboard?.('', defaultColumn)).toBe('');
    });
  });

  describe('formatClipboard', () => {
    it('should format clipboard value using option label', () => {
      expect(DropdownColumnPlugin.formatClipboard?.('elec', defaultColumn)).toBe('Elektronik');
      expect(DropdownColumnPlugin.formatClipboard?.('clothing', defaultColumn)).toBe('Giyim');
    });

    it('should fallback to raw value if not found in options', () => {
      expect(DropdownColumnPlugin.formatClipboard?.('other', defaultColumn)).toBe('other');
      expect(DropdownColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare strings using Turkish collation', () => {
      expect(DropdownColumnPlugin.comparator?.('a', 'b')).toBeLessThan(0);
      expect(DropdownColumnPlugin.comparator?.('b', 'a')).toBeGreaterThan(0);
      expect(DropdownColumnPlugin.comparator?.('a', 'a')).toBe(0);
    });
  });

  describe('paintDropdown (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        arc: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render colored dot, label text, and chevron dropdown button', () => {
      const ctx = createMockContext();
      paintDropdown({
        ctx,
        value: 'elec',
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

      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);

      // Color dot
      expect(ctx.arc).toHaveBeenCalledWith(12, 17, 3.5, 0, Math.PI * 2);

      // Option label text
      expect(ctx.fillText).toHaveBeenCalledWith('Elektronik', 21, 17);

      // ComboBox chevron box
      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should render in dark mode with dark dot color', () => {
      const ctx = createMockContext();
      paintDropdown({
        ctx,
        value: 'clothing',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 150,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.arc).toHaveBeenCalledWith(12, 17, 3.5, 0, Math.PI * 2);
      expect(ctx.fillText).toHaveBeenCalledWith('Giyim', 21, 17);
    });

    it('should not render dropdown button if width <= 48', () => {
      const ctx = createMockContext();
      paintDropdown({
        ctx,
        value: 'food',
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

      expect(ctx.roundRect).not.toHaveBeenCalled();
    });
  });
});
