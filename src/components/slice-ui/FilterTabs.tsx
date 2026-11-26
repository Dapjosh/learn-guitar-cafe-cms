'use client';

import React from 'react';
import { cn } from '@lgc_cms/util';

export type FilterTab = { id: string; label: string; count?: number | null };

export type FilterTabColors = {
  activeBg: string;
  activeText: string;
  text: string;
  border: string;
  countBg: string;
  countText: string;
};

/**
 * Folder-style filter tabs with optional counts, sitting on an underline.
 * Scrolls horizontally on small screens. Used by the course catalog and blog grid.
 */
export const FilterTabs = ({
  tabs,
  activeId,
  onSelect,
  colors,
  showCounts = true,
  align = 'left',
  label = 'Filter',
  className,
}: {
  tabs: FilterTab[];
  activeId: string;
  onSelect: (id: string) => void;
  colors: FilterTabColors;
  showCounts?: boolean;
  align?: 'left' | 'center';
  label?: string;
  className?: string;
}) => (
  <div className={cn(align === 'left' && 'border-b', className)} style={{ borderColor: colors.border }}>
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        align === 'left' ? '-mb-px' : 'md:justify-center'
      )}
    >
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 border px-3 sm:px-3.5 py-2.5 text-sm sm:text-[1rem] whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
              align === 'left' ? 'rounded-t-md border-b-0' : 'rounded-md'
            )}
            style={{
              backgroundColor: active ? colors.activeBg : 'transparent',
              borderColor: active ? colors.activeBg : colors.border,
              color: active ? colors.activeText : colors.text,
            }}
          >
            {tab.label}
            {showCounts && typeof tab.count === 'number' && (
              <span
                className="min-w-[1.35rem] h-[1.35rem] px-1 rounded-full inline-flex items-center justify-center text-[0.7rem] leading-none border"
                style={
                  active
                    ? { borderColor: colors.activeText, color: colors.activeText }
                    : { backgroundColor: colors.countBg, borderColor: colors.countBg, color: colors.countText }
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default FilterTabs;
