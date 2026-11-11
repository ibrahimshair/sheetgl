// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RfiColumnPlugin } from '../../src/datagrid/columns/types/RfiColumn/index';
import { paintRfi } from '../../src/datagrid/columns/types/RfiColumn/RfiPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { ColumnDef } from '../../src/datagrid/types/grid';

describe('RfiColumnPlugin & RfiPainter', () => {
  const defaultColumn: ColumnDef = { id: 'rfi_no', title: 'RFI No', width: 140, type: 'rfi' };

  describe('Plugin Definition', () => {
    it('should have correct type and paint function', () => {
      expect(RfiColumnPlugin.type).toBe('rfi');
      expect(RfiColumnPlugin.paint).toBe(paintRfi);
    });
  });

  describe('onPointerDown (Hit-Testing)', () => {
    let dispatchEventSpy: any;

    beforeEach(() => {
      dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    });

    afterEach(() => {
      dispatchEventSpy.mockRestore();
    });

    it('should trigger onRfiSearchClick callback when clicking on magnifier button (🔍)', () => {
      const onRfiSearchClick = vi.fn();
      const col: any = { ...defaultColumn, onRfiSearchClick };

      // Search button is at column.width - 20 - 6 = 114 (range: 112 to 136)
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 120,
        localY: 15,
        column: col,
        row: { id: 1, rfi_no: 'RFI-001' },
        rowIndex: 2,
        value: 'RFI-001',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(onRfiSearchClick).toHaveBeenCalledWith('RFI-001', { id: 1, rfi_no: 'RFI-001' }, 2);
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it('should dispatch sheetgl-open-rfi-logs CustomEvent when search button is clicked and no callback provided', () => {
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 120,
        localY: 15,
        column: defaultColumn,
        row: { id: 1, rfi_no: 'RFI-002' },
        rowIndex: 0,
        value: 'RFI-002',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('sheetgl-open-rfi-logs');
      expect(event.detail.rfiNo).toBe('RFI-002');
    });

    it('should trigger onPdfClick callback when clicking PDF button (📄) and PDF is available', () => {
      const onPdfClick = vi.fn();
      const col: any = { ...defaultColumn, onPdfClick };

      // With PDF, pdfBtnX = searchBtnX - 20 - 4 = 114 - 24 = 90 (range: 88 to 112)
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 95,
        localY: 15,
        column: col,
        row: { signed_rfi: 'https://example.com/rfi.pdf' },
        rowIndex: 1,
        value: 'RFI-003',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(onPdfClick).toHaveBeenCalledWith('https://example.com/rfi.pdf', { signed_rfi: 'https://example.com/rfi.pdf' }, 1);
    });

    it('should dispatch sheetgl-open-pdf CustomEvent when PDF button is clicked and no callback provided', () => {
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 95,
        localY: 15,
        column: defaultColumn,
        row: { has_signed_pdf: true },
        rowIndex: 0,
        value: 'RFI-004',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: true, shouldOpenEditor: false });
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('sheetgl-open-pdf');
      expect(event.detail.url).toBe('/api/v1/rfi/pdf/RFI-004');
    });

    it('should not handle PDF click when hasPdf is false', () => {
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 95,
        localY: 15,
        column: defaultColumn,
        row: {}, // No PDF property
        rowIndex: 0,
        value: 'RFI-005',
        setValue: vi.fn(),
      });

      // Since hasPdf is false, clicking at localX 95 falls back to text area
      expect(result).toEqual({ handled: false, shouldOpenEditor: true });
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it('should return handled: false, shouldOpenEditor: true when clicking on cell text area', () => {
      const result = RfiColumnPlugin.onPointerDown?.({
        localX: 30,
        localY: 15,
        column: defaultColumn,
        row: { has_signed_pdf: true },
        rowIndex: 0,
        value: 'RFI-006',
        setValue: vi.fn(),
      });

      expect(result).toEqual({ handled: false, shouldOpenEditor: true });
    });
  });

  describe('Clipboard & Comparator', () => {
    it('should trim text in parseClipboard', () => {
      expect(RfiColumnPlugin.parseClipboard?.('  RFI-123  ', defaultColumn)).toBe('RFI-123');
      expect(RfiColumnPlugin.parseClipboard?.('', defaultColumn)).toBe('');
    });

    it('should format clipboard values safely', () => {
      expect(RfiColumnPlugin.formatClipboard?.('RFI-100', defaultColumn)).toBe('RFI-100');
      expect(RfiColumnPlugin.formatClipboard?.(null as any, defaultColumn)).toBe('');
      expect(RfiColumnPlugin.formatClipboard?.(undefined as any, defaultColumn)).toBe('');
    });

    it('should compare values with Turkish locale rules (tr-TR)', () => {
      // In Turkish, 'ç' comes before 'd', 'ş' comes before 't'
      expect(RfiColumnPlugin.comparator?.('çarşı', 'dağ')).toBeLessThan(0);
      expect(RfiColumnPlugin.comparator?.('şeker', 'tuz')).toBeLessThan(0);
      expect(RfiColumnPlugin.comparator?.('A-01', 'A-01')).toBe(0);
      expect(RfiColumnPlugin.comparator?.(null as any, 'B-02')).toBeLessThan(0);
    });
  });

  describe('paintRfi (Canvas Rendering)', () => {
    const createMockCtx = () => {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        clip: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 1,
      } as any;
    };

    it('should render RFI text, search button, and PDF button when PDF is available', () => {
      const mockCtx = createMockCtx();

      paintRfi({
        ctx: mockCtx,
        value: 'RFI-2026',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 140,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: defaultColumn,
        row: { has_signed_pdf: true },
        rowIndex: 0,
      });

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Text clip and fillText
      expect(mockCtx.clip).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('RFI-2026', 8, 15);

      // Buttons rendering: PDF (📄) and Magnifier (🔍)
      expect(mockCtx.fillText).toHaveBeenCalledWith('📄', expect.any(Number), expect.any(Number));
      expect(mockCtx.fillText).toHaveBeenCalledWith('🔍', expect.any(Number), expect.any(Number));
    });

    it('should render placeholder text when value is empty or dash', () => {
      const mockCtx = createMockCtx();
      const colWithPlaceholder: ColumnDef = { ...defaultColumn, placeholder: 'RFI Giriniz' };

      paintRfi({
        ctx: mockCtx,
        value: '-',
        theme: appleLight,
        locale: enUS,
        x: 0,
        y: 0,
        width: 140,
        height: 30,
        isHovered: false,
        isSelected: false,
        column: colWithPlaceholder,
        row: {},
        rowIndex: 0,
      });

      expect(mockCtx.fillText).toHaveBeenCalledWith('RFI Giriniz', 8, 15);
      // Search button is still rendered
      expect(mockCtx.fillText).toHaveBeenCalledWith('🔍', expect.any(Number), expect.any(Number));
      // PDF button is NOT rendered
      expect(mockCtx.fillText).not.toHaveBeenCalledWith('📄', expect.any(Number), expect.any(Number));
    });

    it('should use dark mode styling when theme is dark', () => {
      const mockCtx = createMockCtx();

      paintRfi({
        ctx: mockCtx,
        value: 'RFI-DARK',
        theme: appleDark,
        locale: enUS,
        x: 0,
        y: 0,
        width: 140,
        height: 30,
        isHovered: true,
        isSelected: false,
        column: defaultColumn,
        row: { signed_rfi: 'https://test.pdf' },
        rowIndex: 0,
      });

      expect(mockCtx.fillText).toHaveBeenCalledWith('RFI-DARK', 8, 15);
      expect(mockCtx.fillText).toHaveBeenCalledWith('📄', expect.any(Number), expect.any(Number));
      expect(mockCtx.fillText).toHaveBeenCalledWith('🔍', expect.any(Number), expect.any(Number));
    });
  });
});
