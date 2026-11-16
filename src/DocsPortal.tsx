import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ColumnCategory, DocsPortalProps, DocSubItem, getDocThemeColors } from './docs/types';
import { buildDocSections } from './docs/sectionRegistry';
import { DocsHeader } from './docs/components/DocsHeader';
import { DocsSidebar } from './docs/components/DocsSidebar';

export type { DocsPortalProps } from './docs/types';

function parseDocSubPath(
  sectionId: string,
  subPath?: string
): {
  columnType: string | null;
  subId: string;
  expandSubId?: string;
} {
  if (!subPath) {
    return { columnType: null, subId: sectionId === 'columns' ? 'col-playground' : '' };
  }
  if (sectionId === 'columns') {
    if (subPath === 'playground') {
      return { columnType: null, subId: 'col-playground' };
    }
    const [colType, tab] = subPath.split('/');
    if (colType) {
      const normalizedTab = tab === 'formatting' ? 'formatting' : 'overview';
      return {
        columnType: colType,
        subId: `col-type-${colType}-${normalizedTab}`,
        expandSubId: `col-type-${colType}`,
      };
    }
  }
  return { columnType: null, subId: subPath };
}

function serializeDocSubPath(sectionId: string, subId: string): string | undefined {
  if (!subId) return undefined;
  if (sectionId === 'columns') {
    if (subId === 'col-playground') return undefined;
    if (subId.startsWith('col-type-')) {
      const rest = subId.slice('col-type-'.length);
      if (rest.endsWith('-overview')) {
        return `${rest.slice(0, -'-overview'.length)}/overview`;
      }
      if (rest.endsWith('-formatting')) {
        return `${rest.slice(0, -'-formatting'.length)}/formatting`;
      }
      return rest;
    }
  }
  return subId;
}

export const DocsPortal: React.FC<DocsPortalProps> = ({
  isDark,
  lang,
  initialSection,
  initialSectionId,
  initialSubPath,
  onSectionChange,
  onToggleTheme,
  onToggleLang,
  onNavigateStudio,
  onNavigateLanding,
  onOpenStudio,
  onOpenLanding,
}) => {
  const isTR = lang === 'tr';
  const resolvedInitialSection = initialSectionId || initialSection || 'quickstart';
  const initialParsed = parseDocSubPath(resolvedInitialSection, initialSubPath);
  const handleGoStudio = onOpenStudio || onNavigateStudio || (() => {});
  const handleGoLanding = onOpenLanding || onNavigateLanding || (() => {});

  const [activeSectionId, setActiveSectionId] = useState<string>(resolvedInitialSection);
  const [activeSubId, setActiveSubId] = useState<string>(initialParsed.subId);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [resolvedInitialSection]: true,
    columns: true,
    validation: true,
  });
  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>(
    initialParsed.expandSubId ? { [initialParsed.expandSubId]: true } : {}
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [colCategoryFilter, setColCategoryFilter] = useState<ColumnCategory>('all');
  const [selectedColumnType, setSelectedColumnType] = useState<string | null>(initialParsed.columnType);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const nextSec = initialSectionId || initialSection;
  const [prevRouteKey, setPrevRouteKey] = useState<string>(`${nextSec || ''}::${initialSubPath || ''}`);
  const currentRouteKey = `${nextSec || ''}::${initialSubPath || ''}`;
  if (nextSec && currentRouteKey !== prevRouteKey) {
    setPrevRouteKey(currentRouteKey);
    const parsed = parseDocSubPath(nextSec, initialSubPath);
    setActiveSectionId(nextSec);
    setSelectedColumnType(parsed.columnType);
    setActiveSubId(parsed.subId);
    setExpandedSections((prev) => ({ ...prev, [nextSec]: true }));
    if (parsed.expandSubId) {
      setExpandedSubItems((prev) => ({ ...prev, [parsed.expandSubId!]: true }));
    }
  }

  // Scroll to initial sub-item anchor on F5 / deep-link load
  useEffect(() => {
    if (!initialSubPath) return;
    const sec = initialSectionId || initialSection || 'quickstart';
    const parsed = parseDocSubPath(sec, initialSubPath);
    if (!parsed.subId) return;
    const timer = setTimeout(() => {
      const targetEl = document.getElementById(parsed.subId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [initialSectionId, initialSection, initialSubPath]);

  const colors = useMemo(() => getDocThemeColors(isDark), [isDark]);

  const handleSelectColumnType = useCallback(
    (colType: string | null, syncUrl: boolean = true) => {
      setSelectedColumnType(colType);
      if (colType) {
        setActiveSubId(`col-type-${colType}-overview`);
        setExpandedSubItems((prev) => ({ ...prev, [`col-type-${colType}`]: true }));
        if (syncUrl) {
          onSectionChange?.('columns', `${colType}/overview`);
        }
      } else {
        setActiveSubId('col-playground');
        if (syncUrl) {
          onSectionChange?.('columns', undefined);
        }
      }
      const mainEl = document.getElementById('docs-main-scroll');
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [onSectionChange]
  );

  const sections = useMemo(
    () =>
      buildDocSections({
        isDark,
        isTR,
        colors,
        colCategoryFilter,
        onCategoryFilterChange: setColCategoryFilter,
        selectedColumnType,
        onSelectColumnType: handleSelectColumnType,
      }),
    [isDark, isTR, colors, colCategoryFilter, selectedColumnType, handleSelectColumnType]
  );

  const visibleSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.titleTr.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.subtitleTr.toLowerCase().includes(q) ||
        s.subtitleEn.toLowerCase().includes(q) ||
        s.subItems.some(
          (sub) =>
            sub.labelTr.toLowerCase().includes(q) ||
            sub.labelEn.toLowerCase().includes(q) ||
            sub.children?.some(
              (child) =>
                child.labelTr.toLowerCase().includes(q) ||
                child.labelEn.toLowerCase().includes(q)
            )
        )
    );
  }, [sections, searchQuery]);

  const activeSection =
    visibleSections.find((s) => s.id === activeSectionId) ||
    visibleSections[0] ||
    sections[0];

  const currentIdx = sections.findIndex((s) => s.id === activeSection.id);
  const prevSection = currentIdx > 0 ? sections[currentIdx - 1] : null;
  const nextSection = currentIdx < sections.length - 1 ? sections[currentIdx + 1] : null;

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setActiveSubId('');
    if (id === 'columns') {
      setSelectedColumnType(null);
    }
    setExpandedSections((prev) => ({ ...prev, [id]: true }));
    setMobileSidebarOpen(false);
    onSectionChange?.(id);
    const mainEl = document.getElementById('docs-main-scroll');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleExpandSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleExpandSubItem = (subId: string) => {
    setExpandedSubItems((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const handleSelectSubItem = (sectionId: string, sub: DocSubItem, parentSubId?: string) => {
    sub.onSelect?.();
    if (activeSectionId !== sectionId) {
      setActiveSectionId(sectionId);
    }
    setActiveSubId(sub.id);
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
    if (parentSubId) {
      setExpandedSubItems((prev) => ({ ...prev, [parentSubId]: true }));
    }
    onSectionChange?.(sectionId, serializeDocSubPath(sectionId, sub.id));
    setMobileSidebarOpen(false);
    setTimeout(() => {
      const targetEl = document.getElementById(sub.id);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
      }}
    >
      <DocsHeader
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        isMobile={isMobile}
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
        onGoLanding={handleGoLanding}
        onGoStudio={handleGoStudio}
        onToggleLang={onToggleLang}
        onToggleTheme={onToggleTheme}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <DocsSidebar
          sections={visibleSections}
          activeSectionId={activeSection.id}
          activeSubId={activeSubId}
          expandedSections={expandedSections}
          expandedSubItems={expandedSubItems}
          searchQuery={searchQuery}
          isTR={isTR}
          colors={colors}
          isMobile={isMobile}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onSearchChange={setSearchQuery}
          onSelectSection={handleSelectSection}
          onToggleExpandSection={handleToggleExpandSection}
          onToggleExpandSubItem={handleToggleExpandSubItem}
          onSelectSubItem={handleSelectSubItem}
        />

        <main
          id="docs-main-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isMobile ? '18px 14px 64px' : '28px 32px 64px',
          }}
        >
          <div style={{ width: '100%' }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  marginBottom: 18,
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span>
                  📑 {isTR ? 'Bölüm:' : 'Section:'}{' '}
                  <strong style={{ color: colors.accent }}>
                    {isTR ? activeSection.titleTr : activeSection.titleEn}
                  </strong>
                </span>
                <span style={{ color: colors.accent, fontSize: 12 }}>
                  {isTR ? 'Tüm Konular ▾' : 'All Topics ▾'}
                </span>
              </button>
            )}

            <div style={{ marginBottom: isMobile ? 20 : 28 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: colors.accentBg,
                  color: colors.accent,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  marginBottom: 10,
                }}
              >
                {isTR ? activeSection.badgeTr : activeSection.badgeEn}
              </span>
              <h1
                style={{
                  fontSize: isMobile ? 24 : 32,
                  fontWeight: 800,
                  margin: '0 0 10px',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {isTR ? activeSection.titleTr : activeSection.titleEn}
              </h1>
              <p style={{ fontSize: isMobile ? 14.5 : 17, color: colors.muted, margin: 0, lineHeight: 1.6 }}>
                {isTR ? activeSection.subtitleTr : activeSection.subtitleEn}
              </p>
            </div>

            <div>{activeSection.render()}</div>

            {/* Bottom Prev / Next Step Navigation */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 24,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              {prevSection ? (
                <button
                  type="button"
                  onClick={() => handleSelectSection(prevSection.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← {isTR ? prevSection.titleTr : prevSection.titleEn}
                </button>
              ) : (
                <div />
              )}

              {nextSection && (
                <button
                  type="button"
                  onClick={() => handleSelectSection(nextSection.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: `1px solid ${colors.accent}`,
                    backgroundColor: colors.accentBg,
                    color: colors.accent,
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isTR ? nextSection.titleTr : nextSection.titleEn} →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
