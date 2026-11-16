// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { LookupColumnPlugin } from '../../src/datagrid/columns/types/LookupColumn/index';
import { paintLookup } from '../../src/datagrid/columns/types/LookupColumn/LookupPainter';
import { LookupEditor } from '../../src/datagrid/columns/types/LookupColumn/LookupEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('LookupColumnPlugin & paintLookup', () => {
  const defaultColumn: ColumnDef = {
    id: 'assignee',
    title: 'Sorumlu',
    width: 180,
    type: 'lookup',
    options: [
      { value: 'usr_1', label: 'Ahmet Yılmaz', subtitle: 'Kıdemli Mimar', fg: '#5B21B6', bg: '#EDE9FE' },
      { value: 'usr_2', label: 'Zeynep Kaya', subtitle: 'Proje Yöneticisi' },
    ],
  };

  describe('Plugin Definition', () => {
    it('should have type lookup, LookupEditor and paintLookup', () => {
      expect(LookupColumnPlugin.type).toBe('lookup');
      expect(LookupColumnPlugin.editorComponent).toBe(LookupEditor);
      expect(LookupColumnPlugin.paint).toBe(paintLookup);
    });
  });

  describe('onPointerDown', () => {
    it('should open editor when clicking right chevron button (localX > width - 26)', () => {
      const result = LookupColumnPlugin.onPointerDown?.({
        localX: 160, // width=180, 180 - 26 = 154
        localY: 17,
        value: 'usr_1',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: true });
    });

    it('should return handled: false when clicking elsewhere on the cell', () => {
      const result = LookupColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 17,
        value: 'usr_1',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('onKeyDown', () => {
    it('should open editor without arguments on Space or Enter', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const spaceHandled = LookupColumnPlugin.onKeyDown?.({
        event: { key: ' ', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'usr_1',
      });
      expect(spaceHandled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith();

      openEditor.mockClear();

      const enterHandled = LookupColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'usr_1',
      });
      expect(enterHandled).toBe(true);
      expect(openEditor).toHaveBeenCalledWith();
    });

    it('should open editor with character when typing single printable key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = LookupColumnPlugin.onKeyDown?.({
        event: { key: 'A', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'usr_1',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('A');
    });

    it('should ignore shortcut modifier combinations', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = LookupColumnPlugin.onKeyDown?.({
        event: { key: 'c', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'usr_1',
      });

      expect(handled).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard', () => {
    it('should map clipboard text to option value by value or label', () => {
      expect(LookupColumnPlugin.parseClipboard?.('Ahmet Yılmaz', defaultColumn)).toBe('usr_1');
      expect(LookupColumnPlugin.parseClipboard?.('usr_2', defaultColumn)).toBe('usr_2');
    });

    it('should fallback to clean text if no option matches', () => {
      expect(LookupColumnPlugin.parseClipboard?.('Bilinmeyen Kullanıcı', defaultColumn)).toBe('Bilinmeyen Kullanıcı');
    });

    it('should return empty string for null or empty input', () => {
      expect(LookupColumnPlugin.parseClipboard?.(null as any, defaultColumn)).toBe('');
      expect(LookupColumnPlugin.parseClipboard?.('', defaultColumn)).toBe('');
    });
  });

  describe('formatClipboard', () => {
    it('should format clipboard value using option label', () => {
      expect(LookupColumnPlugin.formatClipboard?.('usr_1', defaultColumn)).toBe('Ahmet Yılmaz');
      expect(LookupColumnPlugin.formatClipboard?.('usr_2', defaultColumn)).toBe('Zeynep Kaya');
    });

    it('should fallback to raw value if not found in options', () => {
      expect(LookupColumnPlugin.formatClipboard?.('usr_99', defaultColumn)).toBe('usr_99');
      expect(LookupColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare strings using Turkish collation', () => {
      expect(LookupColumnPlugin.comparator?.('Ahmet', 'Zeynep')).toBeLessThan(0);
      expect(LookupColumnPlugin.comparator?.('Zeynep', 'Ahmet')).toBeGreaterThan(0);
      expect(LookupColumnPlugin.comparator?.('Ahmet', 'Ahmet')).toBe(0);
    });
  });

  describe('paintLookup (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 70 }),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render initials avatar circle, label, and subtitle', () => {
      const ctx = createMockContext();
      paintLookup({
        ctx,
        value: 'usr_1',
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

      // Avatar circle
      expect(ctx.arc).toHaveBeenCalledWith(18, 17, 10, 0, Math.PI * 2);

      // Initials "AY" for "Ahmet Yılmaz"
      expect(ctx.fillText).toHaveBeenCalledWith('AY', 18, 17);

      // Primary label and subtitle
      expect(ctx.fillText).toHaveBeenCalledWith('Ahmet Yılmaz', expect.any(Number), 17);
      expect(ctx.fillText).toHaveBeenCalledWith(' · Kıdemli Mimar', expect.any(Number), 17);

      // Chevron
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should render single word initial when label has one word', () => {
      const ctx = createMockContext();
      paintLookup({
        ctx,
        value: 'admin',
        column: {
          ...defaultColumn,
          options: [{ value: 'admin', label: 'Admin' }],
        },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 180,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      // "Admin" -> "AD"
      expect(ctx.fillText).toHaveBeenCalledWith('AD', 18, 17);
      expect(ctx.fillText).toHaveBeenCalledWith('Admin', expect.any(Number), 17);
    });

    it('should not render anything if value is empty', () => {
      const ctx = createMockContext();
      paintLookup({
        ctx,
        value: '',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 180,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });
});
