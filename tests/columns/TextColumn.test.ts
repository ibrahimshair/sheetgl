// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { TextColumnPlugin } from '../../src/datagrid/columns/types/TextColumn/index';
import { paintText } from '../../src/datagrid/columns/types/TextColumn/TextPainter';
import { TextEditor } from '../../src/datagrid/columns/types/TextColumn/TextEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('TextColumnPlugin & TextPainter', () => {
  const defaultColumn: ColumnDef = {
    id: 'name',
    title: 'Ad Soyad',
    width: 160,
    type: 'text',
  };

  describe('Plugin Definition', () => {
    it('should have type text, TextEditor and paintText', () => {
      expect(TextColumnPlugin.type).toBe('text');
      expect(TextColumnPlugin.editorComponent).toBe(TextEditor);
      expect(TextColumnPlugin.paint).toBe(paintText);
    });
  });

  describe('onKeyDown (First-Key Capture)', () => {
    it('should capture single characters and open editor with that character', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = TextColumnPlugin.onKeyDown?.({
        event: { key: 'M', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'Ali',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('M');
    });

    it('should ignore modifier combinations and special keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handledCtrl = TextColumnPlugin.onKeyDown?.({
        event: { key: 'c', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'Ali',
      });
      expect(handledCtrl).toBe(false);

      const handledF2 = TextColumnPlugin.onKeyDown?.({
        event: { key: 'F2', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'Ali',
      });
      expect(handledF2).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim string on parseClipboard', () => {
      expect(TextColumnPlugin.parseClipboard?.('  Deneme Metin  ', defaultColumn)).toBe('Deneme Metin');
    });

    it('should format clipboard value as string or empty string', () => {
      expect(TextColumnPlugin.formatClipboard?.('Örnek', defaultColumn)).toBe('Örnek');
      expect(TextColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(TextColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare strings using numeric and Turkish collation', () => {
      expect(TextColumnPlugin.comparator?.('Item 2', 'Item 10')).toBeLessThan(0);
      expect(TextColumnPlugin.comparator?.('Item 10', 'Item 2')).toBeGreaterThan(0);
      expect(TextColumnPlugin.comparator?.('Çelik', 'Demir')).toBeLessThan(0);
      expect(TextColumnPlugin.comparator?.('Test', 'Test')).toBe(0);
    });
  });

  describe('paintText (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render standard cell text clipped with padding', () => {
      const ctx = createMockContext();
      paintText({
        ctx,
        value: 'Mehmet Yılmaz',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 160,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.rect).toHaveBeenCalledWith(10, 0, 140, 34);
      expect(ctx.clip).toHaveBeenCalled();
      expect(ctx.fillStyle).toBe(appleLight.canvas.cellText);
      expect(ctx.fillText).toHaveBeenCalledWith('Mehmet Yılmaz', 10, 17);
    });

    it('should render clickable link-styled cell text when onCellClick is provided', () => {
      const ctx = createMockContext();
      paintText({
        ctx,
        value: 'Detaylar',
        column: { ...defaultColumn, onCellClick: vi.fn() },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 160,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.font).toContain('600');
      expect(ctx.fillStyle).toBe('#1D4ED8'); // Hovered blue in light mode
      expect(ctx.fillText).toHaveBeenCalledWith('Detaylar', 10, 17);
    });

    it('should render placeholder in italic when value is empty and placeholder is configured', () => {
      const ctx = createMockContext();
      paintText({
        ctx,
        value: '',
        column: { ...defaultColumn, placeholder: 'Metin giriniz...' },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 160,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.font).toContain('italic');
      expect(ctx.fillText).toHaveBeenCalledWith('Metin giriniz...', 10, 17);
    });

    it('should not render anything if value is empty and no placeholder exists', () => {
      const ctx = createMockContext();
      paintText({
        ctx,
        value: null as any,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 160,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('should not render if width is smaller than horizontal padding', () => {
      const ctx = createMockContext();
      paintText({
        ctx,
        value: 'Gizli',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 15, // width - 20 <= 0
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
