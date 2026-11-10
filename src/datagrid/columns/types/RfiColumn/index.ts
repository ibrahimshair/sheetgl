import { IColumnTypePlugin } from '../../IColumnTypePlugin';
import { paintRfi } from './RfiPainter';

export const RfiColumnPlugin: IColumnTypePlugin<string> = {
  type: 'rfi',
  paint: paintRfi,

  onPointerDown({ localX, column, row, rowIndex, value }) {
    const raw = value != null ? String(value).trim() : '';
    const hasPdf = Boolean(
      (typeof (column as any).hasPdf === 'function' && (column as any).hasPdf(raw, row)) ||
      (row && (row.signed_rfi || row.has_signed_pdf || row.signed_rfi_url || row.created_rfi || row.has_created_pdf))
    );

    const btnW = 20;
    const searchBtnX = column.width - btnW - 6;
    const pdfBtnX = hasPdf ? searchBtnX - btnW - 4 : -999;

    // Check if clicked on Search button (🔍)
    if (localX >= searchBtnX - 2 && localX <= searchBtnX + btnW + 2) {
      if (typeof (column as any).onRfiSearchClick === 'function') {
        (column as any).onRfiSearchClick(raw, row, rowIndex ?? 0);
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sheetgl-open-rfi-logs', {
            detail: { rfiNo: raw, row, rowIndex, column },
          })
        );
      }
      return { handled: true, shouldOpenEditor: false };
    }

    // Check if clicked on PDF button (📄)
    if (hasPdf && localX >= pdfBtnX - 2 && localX <= pdfBtnX + btnW + 2) {
      const pdfUrl =
        (row && (row.signed_rfi_url || row.signed_rfi || row.created_rfi_url || row.created_rfi)) ||
        `/api/v1/rfi/pdf/${encodeURIComponent(raw)}`;

      if (typeof (column as any).onPdfClick === 'function') {
        (column as any).onPdfClick(pdfUrl, row, rowIndex ?? 0);
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sheetgl-open-pdf', {
            detail: { url: pdfUrl, title: `RFI PDF (${raw})`, row, rowIndex, column },
          })
        );
      }
      return { handled: true, shouldOpenEditor: false };
    }

    // Clicked elsewhere on cell -> allow text editing / selection
    return { handled: false, shouldOpenEditor: true };
  },

  comparator(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''), 'tr-TR');
  },

  formatClipboard(val) {
    return String(val ?? '');
  },

  parseClipboard(text) {
    return text.trim();
  },
};
