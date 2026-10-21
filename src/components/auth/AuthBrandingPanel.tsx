'use client';

import React from 'react';
import { Logo } from '@/components/ui/Logo';
import { CheckCircle2, ShieldCheck, MessageCircle, MapPin } from 'lucide-react';

export interface AuthBenefit {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface AuthTestimonial {
  quote: string;
  author: string;
  role: string;
  initials?: string;
}

interface AuthBrandingPanelProps {
  badgeText?: string;
  title: string;
  description: string;
  benefits?: AuthBenefit[];
  testimonial?: AuthTestimonial;
  statsPill?: {
    count: string;
    label: string;
  };
}

const DEFAULT_BENEFITS: AuthBenefit[] = [
  {
    title: 'Verified Business Directory',
    description: 'Authentic companies, artisans, and cooperatives verified under Zimbabwean legal standards.',
    icon: ShieldCheck,
  },
  {
    title: 'Direct WhatsApp Inquiries',
    description: 'Buyers and suppliers connect straight to your desk with zero intermediary fees.',
    icon: MessageCircle,
  },
  {
    title: 'All 10 Provinces Covered',
    description: 'Commercial trade reach across Harare, Bulawayo, Mutare, Gweru, and all economic hubs.',
    icon: MapPin,
  },
];

export function AuthBrandingPanel({
  badgeText = "Zimbabwe's Commercial Directory",
  title,
  description,
  benefits = DEFAULT_BENEFITS,
  testimonial,
  statsPill = {
    count: '5,200+',
    label: 'verified Zimbabwean businesses',
  },
}: AuthBrandingPanelProps) {
  return (
    <div className="relative hidden lg:flex lg:w-5/12 xl:w-5/12 flex-col justify-between overflow-hidden bg-[#07131e] p-10 xl:p-12 text-white border-r border-slate-800/80 z-10">
      {/* Subtle organic ambient gradients (no space stars or sci-fi rings) */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[380px] w-[380px] rounded-full bg-emerald-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[340px] w-[340px] rounded-full bg-teal-800/15 blur-[120px]" />

      {/* Top: Logo & Main Pitch */}
      <div className="relative z-10 space-y-8">
        <div>
          <Logo size="md" priority />
        </div>

        <div className="space-y-3.5">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        {/* 3 Straightforward Value Pillars */}
        {benefits && benefits.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            {benefits.map((item, idx) => {
              const IconComp = item.icon || CheckCircle2;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white tracking-wide">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Middle/Bottom: Human Proof or Testimonial */}
      <div className="relative z-10 my-6">
        {testimonial ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xs">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                {testimonial.initials || testimonial.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{testimonial.author}</div>
                <div className="text-[11px] text-slate-400">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ) : statsPill ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-300">
                <strong className="text-white font-bold">{statsPill.count}</strong> {statsPill.label}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">All 10 Provinces</span>
          </div>
        ) : null}
      </div>

      {/* Bottom: Dignified Clean Footer */}
      <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
        <span>&copy; {new Date().getFullYear()} Sadza Connect</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Harare, Zimbabwe</span>
          <span>&bull;</span>
          <span>Terms &amp; Privacy</span>
        </div>
      </div>
    </div>
  );
}
