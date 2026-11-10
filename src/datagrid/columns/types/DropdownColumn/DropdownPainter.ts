import { CellPaintContext } from '../../IColumnTypePlugin';

export function paintDropdown({
  ctx,
  value,
  column,
  theme,
  x,
  y,
  width,
  height,
  isHovered,
  isSelected,
}: CellPaintContext<string>): void {
  ctx.save();

  const valLower = String(value ?? '').trim().toLowerCase();
  const opt = column.options?.find(
    (o) =>
      o.value === value ||
      String(o.value).trim().toLowerCase() === valLower ||
      (Boolean(o.label) && String(o.label).trim().toLowerCase() === valLower)
  );
  const displayLabel = opt ? opt.label : value != null ? String(value) : '';

  // Optional subtle color dot on left if option defines colors
  let textStartX = x + 8;
  if (displayLabel && opt && (opt.bg || opt.darkFg || opt.fg)) {
    const dotColor = theme.isDark
      ? opt.darkFg || '#38BDF8'
      : opt.fg || '#0284C7';
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(x + 12, y + height / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    textStartX = x + 21;
  }

  // Cell label text
  if (displayLabel) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(textStartX, y, Math.max(0, width - (textStartX - x) - 28), height);
    ctx.clip();

    ctx.fillStyle = theme.canvas.cellText;
    ctx.font = `500 ${theme.fontSize}px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayLabel, textStartX, y + height / 2);
    ctx.restore();
  }

  // ComboBox Dropdown Button on right side of cell
  if (width > 48) {
    const btnSize = 18;
    const btnX = x + width - btnSize - 5;
    const btnY = y + (height - btnSize) / 2;

    ctx.fillStyle =
      isSelected || isHovered
        ? theme.isDark
          ? 'rgba(56, 189, 248, 0.16)'
          : 'rgba(2, 132, 199, 0.10)'
        : theme.isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(15, 23, 42, 0.04)';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnSize, btnSize, 4);
    ctx.fill();

    // Chevron arrow
    ctx.fillStyle =
      isSelected || isHovered
        ? theme.dom.accentColor
        : theme.isDark
        ? '#94A3B8'
        : '#64748B';
    ctx.beginPath();
    const cx = btnX + btnSize / 2;
    const cy = btnY + btnSize / 2;
    ctx.moveTo(cx - 3.5, cy - 1.5);
    ctx.lineTo(cx + 3.5, cy - 1.5);
    ctx.lineTo(cx, cy + 2.5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
