import { CellPaintContext } from '../../IColumnTypePlugin';

/**
 * Paints an iOS/modern toggle switch inside the cell as an alternative to a checkbox.
 * ON state: emerald green pill track with white thumb on the right containing a checkmark (✓).
 * OFF state: slate pill track with white thumb on the left containing a cross (✕).
 */
export function paintSwitch({
  ctx,
  value,
  theme,
  x,
  y,
  width,
  height,
  isSelected,
  isHovered,
}: CellPaintContext<boolean>): void {
  const trackW = Math.min(40, Math.max(28, width - 12));
  const trackH = 22;
  if (width < 32 || height < 20) return;

  const trackX = Math.round(x + (width - trackW) / 2);
  const trackY = Math.round(y + (height - trackH) / 2);
  const radius = trackH / 2;
  const isOn = Boolean(value);

  ctx.save();

  // Optional outer focus/selection ring (matching active/selected switch style)
  if (isSelected) {
    ctx.strokeStyle = theme.canvas.selectionBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(trackX - 2.5, trackY - 2.5, trackW + 5, trackH + 5, radius + 2.5);
    ctx.stroke();
  }

  // Track background & border
  if (isOn) {
    ctx.fillStyle = isHovered ? '#059669' : '#10B981';
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, trackW, trackH, radius);
    ctx.fill();
  } else {
    ctx.fillStyle = isHovered
      ? theme.isDark
        ? '#475569'
        : '#CBD5E1'
      : theme.isDark
      ? '#334155'
      : '#DCE5F0';
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, trackW, trackH, radius);
    ctx.fill();

    ctx.strokeStyle = theme.isDark ? '#475569' : '#B8C7D9';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Circular thumb
  const thumbPad = 3;
  const thumbR = (trackH - thumbPad * 2) / 2;
  const thumbX = isOn ? trackX + trackW - thumbPad - thumbR : trackX + thumbPad + thumbR;
  const thumbY = trackY + trackH / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(thumbX, thumbY, thumbR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Icon inside thumb: ✓ when ON, ✕ when OFF
  ctx.strokeStyle = isOn ? '#0F172A' : '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  if (isOn) {
    ctx.moveTo(thumbX - 3, thumbY + 0.2);
    ctx.lineTo(thumbX - 0.8, thumbY + 2.4);
    ctx.lineTo(thumbX + 3.2, thumbY - 2.2);
  } else {
    ctx.moveTo(thumbX - 2.4, thumbY - 2.4);
    ctx.lineTo(thumbX + 2.4, thumbY + 2.4);
    ctx.moveTo(thumbX + 2.4, thumbY - 2.4);
    ctx.lineTo(thumbX - 2.4, thumbY + 2.4);
  }
  ctx.stroke();

  ctx.restore();
}

