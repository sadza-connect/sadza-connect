'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import {
  Search,
  ChevronDown,
  Check,
  X,
  Sparkles,
  Sun,
  Sprout,
  Hammer,
  Truck,
  Car,
  Activity,
  Briefcase,
  Utensils,
  Building2,
  Palmtree,
  Laptop,
  Landmark,
  GraduationCap,
  Factory,
  Shield,
  Camera,
} from 'lucide-react';
import {
  INDUSTRY_CATEGORIES,
  IndustryCategory,
  filterCategories,
} from '@/lib/data/categories';

// Map icon names to Lucide icons
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Sprout,
  Hammer,
  Truck,
  Car,
  Activity,
  Briefcase,
  Utensils,
  Building2,
  Palmtree,
  Laptop,
  Landmark,
  GraduationCap,
  Factory,
  Shield,
  Camera,
  Sparkles,
};

interface CategoryComboboxProps {
  value: string;
  onChange: (categoryName: string) => void;
  onSelectOtherWithSpecialty?: (specialty: string) => void;
  error?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  onSelectOtherWithSpecialty,
  error,
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const listboxId = useId();

  // Find the currently selected category object
  const selectedCategory = INDUSTRY_CATEGORIES.find((c) => c.name === value);

  // Filter categories based on search query
  const filtered = filterCategories(searchQuery);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus the search input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].name);
      } else if (searchQuery.trim() && onSelectOtherWithSpecialty) {
        handleCustomOtherSelection(searchQuery.trim());
      }
    }
  };

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCustomOtherSelection = (customQuery: string) => {
    if (onSelectOtherWithSpecialty) {
      onSelectOtherWithSpecialty(customQuery);
    } else {
      onChange('Other (Please specify)');
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Resolve icon for category
  const renderIcon = (iconName: string, className = 'h-4 w-4') => {
    const IconComponent = CATEGORY_ICONS[iconName] || Sparkles;
    return <IconComponent className={className} />;
  };

  return (
    <div ref={containerRef} className="relative w-full text-left" onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border py-2.5 px-3.5 text-xs text-left transition-all font-medium ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/25 bg-white dark:bg-slate-900 shadow-sm'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 hover:border-slate-400 dark:hover:border-slate-600'
        } ${error ? '!border-rose-500 !ring-rose-500/20' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedCategory ? (
            <>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                {renderIcon(selectedCategory.iconName, 'h-3.5 w-3.5')}
              </div>
              <span className="truncate text-slate-900 dark:text-white font-semibold">
                {selectedCategory.name}
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              Search or select category (e.g. Solar, Mining, Transport)...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {selectedCategory && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50">
              Change
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-500' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Search Input Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder="Type to search (e.g. solar, mining, haulage, food)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Popular Filter Chips */}
            {!searchQuery && (
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500 dark:text-slate-400 no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Popular:</span>
                {['Solar', 'Agriculture', 'Mining', 'Transport', 'Hardware', 'IT'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setHighlightedIndex(0);
                    }}
                    className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100/50 dark:divide-slate-800/50 scroll-smooth"
          >
            {filtered.length > 0 ? (
              filtered.map((cat, index) => {
                const isSelected = cat.name === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={cat.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(cat.name)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : isSelected
                        ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected || isHighlighted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {renderIcon(cat.iconName, 'h-3.5 w-3.5')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs truncate">
                            {cat.name}
                          </span>
                          {cat.popular && !searchQuery && (
                            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="shrink-0 text-emerald-600 dark:text-emerald-400 self-center">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Smart Zero Results Fallback - Direct Option to Use "Other" */
              <div className="p-4 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  No standard category for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  You can register under <strong className="text-slate-700 dark:text-slate-300">Other Services</strong> while highlighting your exact trade on your profile!
                </p>

                <button
                  type="button"
                  onClick={() => handleCustomOtherSelection(searchQuery)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Use &ldquo;Other&rdquo; &amp; set specialty to &ldquo;{searchQuery}&rdquo;</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Helper */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Use ↑↓ arrows to navigate, Enter to select</span>
            <span>20 Zimbabwe Sectors</span>
          </div>
        </div>
      )}
    </div>
  );
}
