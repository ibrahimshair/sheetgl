// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UrlColumnPlugin, paintUrl } from '../../src/datagrid/columns/types/UrlColumn/index';
import { TextEditor } from '../../src/datagrid/columns/types/TextColumn/TextEditor';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('UrlColumnPlugin & paintUrl', () => {
  const defaultColumn: ColumnDef = {
    id: 'website',
    title: 'Web Sitesi',
    width: 200,
    type: 'url',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Plugin Definition', () => {
    it('should have type url, TextEditor and paintUrl', () => {
      expect(UrlColumnPlugin.type).toBe('url');
      expect(UrlColumnPlugin.editorComponent).toBe(TextEditor);
      expect(UrlColumnPlugin.paint).toBe(paintUrl);
    });
  });

  describe('onPointerDown (External Link Trigger)', () => {
    it('should open external link in new tab when clicking the launch icon (localX > width - 24)', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const result = UrlColumnPlugin.onPointerDown?.({
        localX: 185, // width=200, width - 24 = 176
        localY: 17,
        value: 'https://example.com/products',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com/products',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should prepend https:// if value lacks protocol', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const result = UrlColumnPlugin.onPointerDown?.({
        localX: 190,
        localY: 17,
        value: 'github.com/ibrahimshair',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://github.com/ibrahimshair',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should return handled: false when clicking elsewhere on the cell (localX <= width - 24)', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const result = UrlColumnPlugin.onPointerDown?.({
        localX: 100,
        localY: 17,
        value: 'https://example.com',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    it('should return handled: false if value is empty even when clicking icon', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const result = UrlColumnPlugin.onPointerDown?.({
        localX: 190,
        localY: 17,
        value: '',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown', () => {
    it('should open text editor when typing character key', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handled = UrlColumnPlugin.onKeyDown?.({
        event: { key: 'h', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'https://foo.com',
      });

      expect(handled).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(openEditor).toHaveBeenCalledWith('h');
    });

    it('should not open editor on modifier keys or non-printable keys', () => {
      const openEditor = vi.fn();
      const preventDefault = vi.fn();

      const handledCtrl = UrlColumnPlugin.onKeyDown?.({
        event: { key: 'c', ctrlKey: true, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(handledCtrl).toBe(false);

      const handledEnter = UrlColumnPlugin.onKeyDown?.({
        event: { key: 'Enter', ctrlKey: false, metaKey: false, altKey: false, preventDefault } as any,
        openEditor,
        setValue: vi.fn(),
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: '',
      });
      expect(handledEnter).toBe(false);
      expect(openEditor).not.toHaveBeenCalled();
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim clipboard text in parseClipboard', () => {
      expect(UrlColumnPlugin.parseClipboard?.('  https://test.com  ', defaultColumn)).toBe('https://test.com');
    });

    it('should format clipboard string', () => {
      expect(UrlColumnPlugin.formatClipboard?.('https://example.com', defaultColumn)).toBe('https://example.com');
      expect(UrlColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare URLs alphabetically using Turkish collation', () => {
      expect(UrlColumnPlugin.comparator?.('https://a.com', 'https://b.com')).toBeLessThan(0);
      expect(UrlColumnPlugin.comparator?.('https://z.com', 'https://a.com')).toBeGreaterThan(0);
      expect(UrlColumnPlugin.comparator?.('https://a.com', 'https://a.com')).toBe(0);
    });
  });

  describe('paintUrl (Canvas 2D Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 85 }),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 0,
      } as unknown as CanvasRenderingContext2D;
    }

    it('should clean url prefix and trailing slash when rendering text', () => {
      const ctx = createMockContext();
      paintUrl({
        ctx,
        value: 'https://www.google.com/',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleLight,
        locale: trTR,
      });

      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);
      expect(ctx.clip).toHaveBeenCalled();

      // Displays cleaned domain "google.com"
      expect(ctx.fillText).toHaveBeenCalledWith('google.com', 8, 17);
      // External link icon "↗" at width - 12
      expect(ctx.fillText).toHaveBeenCalledWith('↗', 188, 17);
      // No underline when not hovered
      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('should draw underline when cell isHovered', () => {
      const ctx = createMockContext();
      paintUrl({
        ctx,
        value: 'https://apple.com',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('apple.com', 8, 17);
      // Underline path
      expect(ctx.moveTo).toHaveBeenCalledWith(8, 17 + 7);
      expect(ctx.lineTo).toHaveBeenCalledWith(8 + 85, 17 + 7);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should not render anything if value is empty or null', () => {
      const ctx = createMockContext();
      paintUrl({
        ctx,
        value: '',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 200,
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
