// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ObjectColumnPlugin } from '../../src/datagrid/columns/types/ObjectColumn/index';
import {
  paintObject,
  normalizeObjectValue,
  formatObjectSummary,
} from '../../src/datagrid/columns/types/ObjectColumn/ObjectPainter';
import { ObjectEditor } from '../../src/datagrid/columns/types/ObjectColumn/ObjectEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('ObjectColumnPlugin & ObjectPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'attributes',
    title: 'Öznitelikler',
    width: 220,
    type: 'object',
  };

  describe('Plugin Definition', () => {
    it('should have type object, ObjectEditor and paintObject', () => {
      expect(ObjectColumnPlugin.type).toBe('object');
      expect(ObjectColumnPlugin.editorComponent).toBe(ObjectEditor);
      expect(ObjectColumnPlugin.paint).toBe(paintObject);
    });
  });

  describe('normalizeObjectValue', () => {
    it('should pass through standard plain objects', () => {
      expect(normalizeObjectValue({ a: 1, b: 'two' })).toEqual({ a: 1, b: 'two' });
    });

    it('should parse JSON strings correctly', () => {
      expect(normalizeObjectValue('{"color": "red", "count": 5}')).toEqual({ color: 'red', count: 5 });
    });

    it('should parse delimiter separated key-value pairs', () => {
      expect(normalizeObjectValue('color: blue, size: XL, active: true, qty: 10')).toEqual({
        color: 'blue',
        size: 'XL',
        active: true,
        qty: 10,
      });
    });

    it('should return empty object for falsy or empty inputs', () => {
      expect(normalizeObjectValue(null)).toEqual({});
      expect(normalizeObjectValue('')).toEqual({});
      expect(normalizeObjectValue('   ')).toEqual({});
    });
  });

  describe('formatObjectSummary', () => {
    it('should format object keys and values with bullet separators', () => {
      const summary = formatObjectSummary({ color: 'red', size: 'M' });
      expect(summary).toBe('color: red • size: M');
    });

    it('should prioritize objectDisplayKey if configured', () => {
      const summary = formatObjectSummary({ code: 'SKU-001', vendor: 'Acme', stock: 50 }, 'code');
      expect(summary).toBe('SKU-001 (vendor: Acme • stock: 50)');
    });

    it('should return empty string for empty object', () => {
      expect(formatObjectSummary({})).toBe('');
    });
  });

  describe('onPointerDown', () => {
    it('should open editor when clicking inspector trigger on right (localX > width - 26)', () => {
      const result = ObjectColumnPlugin.onPointerDown?.({
        localX: 200, // width=220, 220 - 26 = 194
        localY: 17,
        value: { a: 1 },
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should return handled: false when clicking elsewhere on the cell', () => {
      const result = ObjectColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 17,
        value: { a: 1 },
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor on Space or Enter key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const enterHandled = ObjectColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: {},
      });
      expect(enterHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      openEditor.mockClear();

      const spaceHandled = ObjectColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: {},
      });
      expect(spaceHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith();
    });

    it('should ignore other keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = ObjectColumnPlugin.onKeyDown?.({
        event: { key: 'a', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: {},
      });
      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should parse clipboard JSON and format clipboard JSON string', () => {
      const parsed = ObjectColumnPlugin.parseClipboard?.('{"model": "X", "year": 2026}', defaultColumn);
      expect(parsed).toEqual({ model: 'X', year: 2026 });

      const formatted = ObjectColumnPlugin.formatClipboard?.({ model: 'X', year: 2026 }, defaultColumn);
      expect(formatted).toBe('{"model":"X","year":2026}');
    });
  });

  describe('comparator', () => {
    it('should compare objects based on their formatted summaries', () => {
      const obj1 = { name: 'Alpha' };
      const obj2 = { name: 'Beta' };
      expect(ObjectColumnPlugin.comparator?.(obj1, obj2)).toBeLessThan(0);
      expect(ObjectColumnPlugin.comparator?.(obj2, obj1)).toBeGreaterThan(0);
      expect(ObjectColumnPlugin.comparator?.(obj1, obj1)).toBe(0);
    });
  });

  describe('paintObject (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 20 }),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 0,
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render {N} badge, key-value summary, and inspector icon (⤢)', () => {
      const ctx = createMockContext();
      paintObject({
        ctx,
        value: { cpu: 'i7', ram: '32GB' },
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 220,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);

      // Badge "{2}"
      expect(ctx.roundRect).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('{2}', expect.any(Number), 17);

      // Key-value text
      expect(ctx.fillText).toHaveBeenCalledWith('cpu: i7 • ram: 32GB', expect.any(Number), 17);

      // Inspector icon
      expect(ctx.fillText).toHaveBeenCalledWith('⤢', 208, 17);
    });

    it('should render dark mode styles', () => {
      const ctx = createMockContext();
      paintObject({
        ctx,
        value: { status: 'ok' },
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 220,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('{1}', expect.any(Number), 17);
      expect(ctx.fillText).toHaveBeenCalledWith('status: ok', expect.any(Number), 17);
    });
  });
});
