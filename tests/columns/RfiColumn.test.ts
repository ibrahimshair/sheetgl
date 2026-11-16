// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RfiColumnPlugin } from '../../src/datagrid/columns/types/RfiColumn/index';
import { paintRfi } from '../../src/datagrid/columns/types/RfiColumn/RfiPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('RfiColumnPlugin & paintRfi', () => {
  const defaultColumn: ColumnDef = {
    id: 'rfi_no',
    title: 'RFI No',
    width: 200,
    type: 'rfi',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Plugin Definition', () => {
    it('should have type rfi and paintRfi', () => {
      expect(RfiColumnPlugin.type).toBe('rfi');
      expect(RfiColumnPlugin.paint).toBe(paintRfi);
    });
  });

  describe('onPointerDown (Search & PDF Button Hits)', () => {
    it('should call onRfiSearchClick callback when clicking the search button (🔍)', () => {
      const onRfiSearchClick = vi.fn();
      const col: ColumnDef = {
        ...defaultColumn,
        onRfiSearchClick,
      } as any;

      // searchBtnX = 200 - 20 - 6 = 174
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 180,
        localY: 17,
        column: col,
        row: { rfi_no: 'RFI-001' },
        rowIndex: 2,
        value: 'RFI-001',
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(onRfiSearchClick).toHaveBeenCalledWith('RFI-001', { rfi_no: 'RFI-001' }, 2);
    });

    it('should dispatch sheetgl-open-rfi-logs CustomEvent if onRfiSearchClick is not provided', () => {
      const eventSpy = vi.fn();
      window.addEventListener('sheetgl-open-rfi-logs', eventSpy);

      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 180,
        localY: 17,
        column: defaultColumn,
        row: { rfi_no: 'RFI-002' },
        rowIndex: 0,
        value: 'RFI-002',
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.rfiNo).toBe('RFI-002');

      window.removeEventListener('sheetgl-open-rfi-logs', eventSpy);
    });

    it('should call onPdfClick callback when clicking the PDF button (📄)', () => {
      const onPdfClick = vi.fn();
      const col: ColumnDef = {
        ...defaultColumn,
        onPdfClick,
      } as any;

      // hasPdf is true when signed_rfi is present on row
      // searchBtnX = 174, pdfBtnX = 174 - 20 - 4 = 150
      const row = { signed_rfi_url: 'https://cdn.example.com/rfi-003.pdf' };
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 155,
        localY: 17,
        column: col,
        row,
        rowIndex: 1,
        value: 'RFI-003',
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(onPdfClick).toHaveBeenCalledWith('https://cdn.example.com/rfi-003.pdf', row, 1);
    });

    it('should dispatch sheetgl-open-pdf event when clicking PDF button without onPdfClick', () => {
      const eventSpy = vi.fn();
      window.addEventListener('sheetgl-open-pdf', eventSpy);

      const row = { has_signed_pdf: true };
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 155,
        localY: 17,
        column: defaultColumn,
        row,
        rowIndex: 0,
        value: 'RFI-004',
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.url).toBe('/api/v1/rfi/pdf/RFI-004');
      expect(event.detail.title).toBe('RFI PDF (RFI-004)');

      window.removeEventListener('sheetgl-open-pdf', eventSpy);
    });

    it('should allow text editor / cell selection when clicking elsewhere on the cell', () => {
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 50,
        localY: 17,
        column: defaultColumn,
        row: {},
        rowIndex: 0,
        value: 'RFI-005',
        setValue: vi.fn(),
        openEditor: vi.fn(),
      });

      expect(result).toEqual({ handled: false, shouldOpenEditor: true });
    });
  });

  describe('parseClipboard & formatClipboard', () => {
    it('should trim string on parseClipboard', () => {
      expect(RfiColumnPlugin.parseClipboard?.('  RFI-1234  ')).toBe('RFI-1234');
    });

    it('should return string representation in formatClipboard', () => {
      expect(RfiColumnPlugin.formatClipboard?.('RFI-999')).toBe('RFI-999');
      expect(RfiColumnPlugin.formatClipboard?.(null as any)).toBe('');
    });
  });

  describe('comparator', () => {
    it('should compare RFI codes alphabetically using Turkish locale', () => {
      expect(RfiColumnPlugin.comparator?.('RFI-001', 'RFI-002')).toBeLessThan(0);
      expect(RfiColumnPlugin.comparator?.('RFI-002', 'RFI-001')).toBeGreaterThan(0);
      expect(RfiColumnPlugin.comparator?.('RFI-001', 'RFI-001')).toBe(0);
    });
  });

  describe('paintRfi (Canvas 2D Rendering)', () => {
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
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 0,
      } as unknown as CanvasRenderingContext2D;
    }

    it('should render RFI text and search button (🔍)', () => {
      const ctx = createMockContext();
      paintRfi({
        ctx,
        value: 'RFI-2026-01',
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

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();

      // Text
      expect(ctx.fillText).toHaveBeenCalledWith('RFI-2026-01', 8, 17);
      // Search icon
      expect(ctx.fillText).toHaveBeenCalledWith('🔍', expect.any(Number), expect.any(Number));
      // No PDF icon when hasPdf is false
      expect(ctx.fillText).not.toHaveBeenCalledWith('📄', expect.any(Number), expect.any(Number));
    });

    it('should render both PDF (📄) and search (🔍) buttons when row has PDF', () => {
      const ctx = createMockContext();
      paintRfi({
        ctx,
        value: 'RFI-2026-02',
        column: defaultColumn,
        row: { signed_rfi: true },
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

      expect(ctx.fillText).toHaveBeenCalledWith('📄', expect.any(Number), expect.any(Number));
      expect(ctx.fillText).toHaveBeenCalledWith('🔍', expect.any(Number), expect.any(Number));
    });

    it('should render placeholder when value is empty and placeholder is defined', () => {
      const ctx = createMockContext();
      paintRfi({
        ctx,
        value: '',
        column: { ...defaultColumn, placeholder: 'RFI Seçiniz...' },
        row: {},
        rowIndex: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 34,
        isHovered: false,
        isSelected: false,
        theme: appleDark,
        locale: trTR,
      });

      expect(ctx.fillText).toHaveBeenCalledWith('RFI Seçiniz...', 8, 17);
    });
  });
});
