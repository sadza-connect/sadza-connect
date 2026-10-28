'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export function CelestialSky() {
  const { resolvedTheme, isTransitioning, transitionDirection } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none"
    >
      {/* ===================================================================
          1. ATMOSPHERIC SKY BACKGROUND LAYERS (Crossfade 1.4s)
          =================================================================== */}

      {/* 1A. DAYLIGHT ATMOSPHERE (Zimbabwe Golden Highveld Sky) */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Sky gradient: rich azure down into soft cerulean, ending in warm daylight savannah gold */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1e40af_0px,#2563eb_250px,#38bdf8_600px,#7dd3fc_950px,#bae6fd_1300px,#fef3c7_1700px,transparent_100%)] opacity-85" />
        {/* Soft daylight ambient cloud glow */}
        <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.7)_0%,rgba(254,243,199,0.35)_40%,transparent_75%)]" />
      </div>

      {/* 1B. DAWN / SUNRISE FLARE (Active when switching to Light Mode - "New Day Emerging") */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out pointer-events-none ${
          isTransitioning && transitionDirection === 'to-light'
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        {/* Sunrise bloom: radiant amber and peach dawn light sweeping across the horizon */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(251,191,36,0.55)_0%,rgba(245,158,11,0.35)_30%,rgba(234,88,12,0.15)_55%,transparent_75%)] mix-blend-screen animate-pulse" />
        <div className="absolute inset-x-0 top-1/4 h-[400px] bg-[linear-gradient(180deg,transparent,rgba(254,240,138,0.3)_50%,transparent)] blur-xl" />
      </div>

      {/* 1C. DUSK / TWILIGHT VEIL (Active when switching to Dark Mode - "Gradual Day to Night") */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out pointer-events-none ${
          isTransitioning && transitionDirection === 'to-dark'
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        {/* Sunset glow: deep twilight purple, magenta and indigo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(147,51,234,0.4)_0%,rgba(99,102,241,0.25)_35%,rgba(244,63,94,0.18)_60%,transparent_80%)] mix-blend-multiply" />
      </div>

      {/* 1D. NIGHT ATMOSPHERE (Cosmic Obsidian & Deep Zimbabwean Slate) */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Deep cosmic gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#020617_0px,#050b1d_280px,#09142b_600px,#0d1e3d_950px,#081326_1400px,transparent_100%)]" />
        {/* Subtle emerald celestial auroral dust (Sadza Connect brand accent) */}
        <div className="absolute -top-32 right-1/4 h-[500px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,rgba(5,150,105,0.04)_45%,transparent_70%)] blur-3xl" />
        {/* Soft violet nebula glow */}
        <div className="absolute top-1/3 left-10 h-[450px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_65%)] blur-3xl" />
      </div>

      {/* ===================================================================
          2. THE CELESTIAL HORIZON ORBITAL SYSTEM (Sun & Moon Wheel)
          =================================================================== */}
      <div className="celestial-horizon-mask">
        {/* 2A. THE SUN WHEEL */}
        <div className="celestial-wheel">
          <div className="celestial-arm-sun">
            {/* Outer Daylight Radiant Solar Corona */}
            <div
              className={`absolute top-1/2 left-1/2 size-[42rem] sm:size-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffffff_0%,rgba(254,240,138,0.5)_20%,rgba(245,158,11,0.22)_45%,transparent_70%)] blur-[6px] transition-opacity duration-200 pointer-events-none mix-blend-screen ${
                isDark ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Radiant Sun Core */}
            <div
              className={`relative size-20 sm:size-24 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-200 ${
                isDark ? 'opacity-20' : 'opacity-100'
              }`}
            >
              {/* Solar Core Sphere */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff_0%,#fef08a_25%,#f59e0b_65%,#d97706_100%)] shadow-[0_0_60px_rgba(245,158,11,0.9),0_0_120px_rgba(251,191,36,0.6)]" />

              {/* Delicate Solar Corona Flare Rays */}
              <svg
                viewBox="0 0 100 100"
                className="absolute -inset-4 size-[132px] animate-[spin_60s_linear_infinite] opacity-60 text-amber-200"
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line
                    key={deg}
                    x1="50"
                    y1="6"
                    x2="50"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* 2B. THE MOON WHEEL */}
        <div className="celestial-wheel celestial-wheel-moon">
          <div className="celestial-arm-moon">
            <div className="celestial-moon-upright">
              {/* Outer Emerald-Silver Lunar Halo */}
              <div
                className={`absolute top-1/2 left-1/2 size-[26rem] sm:size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.35)_0%,rgba(16,185,129,0.18)_28%,rgba(56,189,248,0.08)_50%,transparent_70%)] blur-[4px] transition-opacity duration-200 pointer-events-none mix-blend-screen ${
                  isDark ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Realistic Vector Lunar Orb with Craters & Maria */}
              <div
                className={`relative size-16 sm:size-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-200 ${
                  isDark ? 'opacity-100' : 'opacity-20'
                }`}
              >
                {/* Silver-Pearl Base Sphere */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff_0%,#f1f5f9_30%,#cbd5e1_70%,#94a3b8_100%)] shadow-[0_0_40px_rgba(255,255,255,0.7),0_0_80px_rgba(16,185,129,0.35)]" />

                {/* Lunar Surface Texture & Craters (SVG) */}
                <svg
                  viewBox="0 0 80 80"
                  className="absolute inset-0 size-full rounded-full opacity-65"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="crater-shadow" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.75" />
                    </radialGradient>
                  </defs>

                  {/* Tycho crater & rays */}
                  <circle cx="54" cy="56" r="6" fill="url(#crater-shadow)" />
                  <circle cx="53" cy="55" r="3" fill="#334155" opacity="0.6" />

                  {/* Mare Imbrium / Sea of Serenity representations */}
                  <ellipse cx="32" cy="28" rx="10" ry="8" fill="url(#crater-shadow)" />
                  <ellipse cx="48" cy="30" rx="8" ry="6" fill="url(#crater-shadow)" opacity="0.8" />
                  <ellipse cx="28" cy="48" rx="9" ry="7" fill="url(#crater-shadow)" opacity="0.7" />

                  {/* Copernicus crater */}
                  <circle cx="28" cy="36" r="4.5" fill="url(#crater-shadow)" />

                  {/* Kepler crater */}
                  <circle cx="18" cy="32" r="3" fill="url(#crater-shadow)" />

                  {/* Crescent shadow rim for 3D realism */}
                  <path
                    d="M 80,40 A 40,40 0 1,1 40,0 A 38,40 0 0,0 80,40 Z"
                    fill="#0f172a"
                    opacity="0.18"
                  />
                </svg>

                {/* Celestial Emerald Stardust Sparkle orbiting the moon */}
                <div className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. SEAMLESS BOTTOM HORIZON FADE INTO PAGE CONTENT
          =================================================================== */}
      <div className="absolute inset-x-0 bottom-0 h-64 sm:h-80 bg-gradient-to-t from-[rgb(var(--color-bg))] via-[rgb(var(--color-bg)/0.8)] to-transparent pointer-events-none" />
    </div>
  );
}
