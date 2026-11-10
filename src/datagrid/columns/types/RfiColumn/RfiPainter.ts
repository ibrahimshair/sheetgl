import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintRfi({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
  column,
  row,
  isHovered,
}: CellPaintContext<string>): void {
  const raw = value != null ? String(value).trim() : '';
  const isValEmpty = !raw || raw === '-';

  // Check whether PDF is available for this RFI
  const hasPdf = Boolean(
    (typeof (column as any).hasPdf === 'function' && (column as any).hasPdf(raw, row)) ||
    (row && (row.signed_rfi || row.has_signed_pdf || row.signed_rfi_url || row.created_rfi || row.has_created_pdf))
  );

  const btnH = 20;
  const btnW = 20;
  const centerY = y + height / 2;
  const btnY = centerY - btnH / 2;

  // Search (Magnifier 🔍) button on the right
  const searchBtnX = x + width - btnW - 6;

  // PDF (📄) button to the left of search button (if PDF exists)
  const pdfBtnX = hasPdf ? searchBtnX - btnW - 4 : -999;

  // Right reserve for action buttons
  const rightReserved = hasPdf ? (btnW * 2 + 14) : (btnW + 10);
  const textPadX = 8;
  const maxTextW = width - textPadX - rightReserved;

  ctx.save();

  // 1. Text rendering
  if (!isValEmpty && maxTextW > 10) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + textPadX, y, maxTextW, height);
    ctx.clip();

    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `600 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(raw, x + textPadX, centerY);
    ctx.restore();
  } else if (isValEmpty && column?.placeholder && maxTextW > 10) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + textPadX, y, maxTextW, height);
    ctx.clip();

    ctx.fillStyle = theme.isDark ? '#64748B' : '#94A3B8';
    ctx.font = `italic ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(column.placeholder, x + textPadX, centerY);
    ctx.restore();
  }

  // 2. Draw PDF Button (if has PDF)
  if (hasPdf && pdfBtnX > x + 10) {
    ctx.save();
    const isDark = theme.isDark;
    const pdfBg = isDark
      ? isHovered ? 'rgba(239, 68, 68, 0.40)' : 'rgba(239, 68, 68, 0.22)'
      : isHovered ? '#fee2e2' : 'rgba(254, 226, 226, 0.75)';
    const pdfBorder = isDark ? 'rgba(239, 68, 68, 0.70)' : 'rgba(239, 68, 68, 0.50)';

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(pdfBtnX, btnY, btnW, btnH, 4);
    } else {
      ctx.rect(pdfBtnX, btnY, btnW, btnH);
    }
    ctx.fillStyle = pdfBg;
    ctx.fill();
    ctx.strokeStyle = pdfBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📄', pdfBtnX + btnW / 2, centerY + 0.5);
    ctx.restore();
  }

  // 3. Draw Magnifier (Search) Button 🔍
  if (searchBtnX > x + 4) {
    ctx.save();
    const isDark = theme.isDark;
    const searchBg = isDark
      ? isHovered ? 'rgba(2, 132, 199, 0.35)' : 'rgba(2, 132, 199, 0.18)'
      : isHovered ? '#e0f2fe' : 'rgba(240, 249, 255, 0.95)';
    const searchBorder = isDark ? '#38bdf8' : 'rgba(2, 132, 199, 0.45)';

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(searchBtnX, btnY, btnW, btnH, 4);
    } else {
      ctx.rect(searchBtnX, btnY, btnW, btnH);
    }
    ctx.fillStyle = searchBg;
    ctx.fill();
    ctx.strokeStyle = searchBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔍', searchBtnX + btnW / 2, centerY + 0.5);
    ctx.restore();
  }

  ctx.restore();
}
