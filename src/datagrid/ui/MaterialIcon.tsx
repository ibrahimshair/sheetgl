import React, { useEffect, useState } from 'react';
import { ensureMaterialSymbolsLoaded } from './materialIconLoader';

export interface MaterialIconProps {
  /** Google Material Symbols icon ligature name (from https://fonts.google.com/icons), e.g. 'add', 'delete', 'tune' */
  name: string;
  /** Icon size in pixels (default: 16) */
  size?: number;
  /** Whether to render the filled variant (FILL 1 vs 0) */
  filled?: boolean;
  /** Font weight (100 - 700, default: 500) */
  weight?: number;
  /** Icon style family ('outlined' | 'rounded', default: 'outlined') */
  variant?: 'outlined' | 'rounded';
  /** Optional CSS color override */
  color?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Optional CSS class name */
  className?: string;
  /** Optional tooltip */
  title?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 16,
  filled = false,
  weight = 500,
  variant = 'outlined',
  color,
  style,
  className,
  title,
}) => {
  const fontFamily =
    variant === 'rounded' ? '"Material Symbols Rounded"' : '"Material Symbols Outlined"';

  const [fontReady, setFontReady] = useState<boolean>(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return false;
    return document.fonts.check(`16px ${fontFamily}`);
  });

  useEffect(() => {
    ensureMaterialSymbolsLoaded();
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    if (document.fonts.check(`16px ${fontFamily}`)) {
      setFontReady(true);
      return;
    }
    let active = true;
    document.fonts.ready.then(() => {
      if (active && document.fonts.check(`16px ${fontFamily}`)) {
        setFontReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [fontFamily]);

  return (
    <span
      className={className}
      title={title}
      aria-hidden={title ? undefined : 'true'}
      style={{
        fontFamily,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: 'normal',
        textTransform: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
        direction: 'ltr',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        fontFeatureSettings: '"liga"',
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.max(20, Math.min(48, size))}`,
        width: size,
        height: size,
        overflow: 'hidden',
        visibility: fontReady ? 'visible' : 'hidden',
        flexShrink: 0,
        userSelect: 'none',
        color,
        ...style,
      }}
    >
      {name}
    </span>
  );
};
