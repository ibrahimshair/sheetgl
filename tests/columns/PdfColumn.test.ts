// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfColumnPlugin } from '../../src/datagrid/columns/types/PdfColumn/index';
import { paintPdf } from '../../src/datagrid/columns/types/PdfColumn/PdfPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('PdfColumnPlugin & paintPdf', () => {
  const defaultColumn: ColumnDef = {
    id: 'document',
    title: 'Sözleşme PDF',
    width: 160,
    type: 'pdf',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Plugin Definition', () => {
    it('should have type pdf and paintPdf', () => {
      expect(PdfColumnPlugin.type).toBe('pdf');
      expect(PdfColumnPlugin.paint).toBe(paintPdf);
    });
  });

  describe('onPointerDown (Viewer Modal & Open New Tab)', () => {
    it('should open in new tab when clicking button 2 (↗)', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      // totalW=78, center alignment startX = (160 - 78)/2 = 41
      // btn2X = 41 + 52 = 93, btn2W = 26 -> range [93, 119]
      const result = PdfColumnPlugin.onPointerDown?.({
        localX: 100,
        localY: 17,
        value: 'docs/contract-101.pdf',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(windowOpenSpy).toHaveBeenCalledWith(
        '/docs/contract-101.pdf',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should invoke onPdfOpenNewTabClick callback when configured', () => {
      const onPdfOpenNewTabClick = vi.fn();
      const col: ColumnDef = {
        ...defaultColumn,
        onPdfOpenNewTabClick,
      } as any;

      const row = { id: 1 };
      const result = PdfColumnPlugin.onPointerDown?.({
        localX: 100,
        localY: 17,
        value: 'https://cdn.example.com/invoice.pdf',
        column: col,
        row,
        rowIndex: 2,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(onPdfOpenNewTabClick).toHaveBeenCalledWith('https://cdn.example.com/invoice.pdf', row, 2);
    });

    it('should invoke onPdfClick callback when clicking button 1 (📄 PDF)', () => {
      const onPdfClick = vi.fn();
      const col: ColumnDef = {
        ...defaultColumn,
        onPdfClick,
      } as any;

      // startX = 41, button 1 is [41, 41 + 48 = 89]
      const row = { id: 2 };
      const result = PdfColumnPlugin.onPointerDown?.({
        localX: 60,
        localY: 17,
        value: 'report.pdf',
        column: col,
        row,
        rowIndex: 4,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(onPdfClick).toHaveBeenCalledWith('/report.pdf', row, 4);
    });

    it('should dispatch sheetgl-open-pdf custom event by default when clicking button 1', () => {
      const eventSpy = vi.fn();
      window.addEventListener('sheetgl-open-pdf', eventSpy);

      const row = { id: 3 };
      const result = PdfColumnPlugin.onPointerDown?.({
        localX: 60,
        localY: 17,
        value: 'presentation.pdf',
        column: defaultColumn,
        row,
        rowIndex: 1,
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.url).toBe('/presentation.pdf');
      expect(event.detail.title).toBe('Sözleşme PDF');

      window.removeEventListener('sheetgl-open-pdf', eventSpy);
    });

    it('should return handled: false when value is empty', () => {
      const result = PdfColumnPlugin.onPointerDown?.({
        localX: 60,
        localY: 17,
        value: '',
        column: defaultColumn,
        row: {},
        rowIndex: 0,        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false });
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim string in parseClipboard', () => {
      expect(PdfColumnPlugin.parseClipboard?.('  document.pdf  ', defaultColumn)).toBe('document.pdf');
    });

    it('should format clipboard string', () => {
      expect(PdfColumnPlugin.formatClipboard?.('file.pdf', defaultColumn)).toBe('file.pdf');
      expect(PdfColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare pdf strings using Turkish locale', () => {
      expect(PdfColumnPlugin.comparator?.('a.pdf', 'b.pdf')).toBeLessThan(0);
      expect(PdfColumnPlugin.comparator?.('b.pdf', 'a.pdf')).toBeGreaterThan(0);
      expect(PdfColumnPlugin.comparator?.('a.pdf', 'a.pdf')).toBe(0);
    });
  });

  describe('paintPdf (Canvas 2D Dual-Button Rendering)', () => {
    function createMockContext() {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 0,
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render PDF badge button (📄 PDF) and new tab button (↗)', () => {
      const ctx = createMockContext();
      paintPdf({
        ctx,
        value: 'contract.pdf',
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

      // Button 1: PDF Badge
      expect(ctx.roundRect).toHaveBeenCalledTimes(2);
      expect(ctx.fillText).toHaveBeenCalledWith('📄 PDF', expect.any(Number), expect.any(Number));

      // Button 2: ↗
      expect(ctx.fillText).toHaveBeenCalledWith('↗', expect.any(Number), expect.any(Number));
    });

    it('should render dark mode colors in dark theme', () => {
      const ctx = createMockContext();
      paintPdf({
        ctx,
        value: 'specs.pdf',
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 160,
        height: 34,
        isHovered: true,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.roundRect).toHaveBeenCalledTimes(2);
      expect(ctx.fillText).toHaveBeenCalledWith('📄 PDF', expect.any(Number), expect.any(Number));
      expect(ctx.fillText).toHaveBeenCalledWith('↗', expect.any(Number), expect.any(Number));
    });

    it('should not render anything if value is empty', () => {
      const ctx = createMockContext();
      paintPdf({
        ctx,
        value: '',
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
  });
});
