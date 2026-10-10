'use client';

import { useState, useEffect } from 'react';
import {
  Home,
  Building,
  PhoneCall,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  PanelHeading,
  AdminButton,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/AdminUI';
import { ImageUploader } from '@/components/admin/ImageUploader';
import {
  getPlatformSettings,
  savePlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';
import { cn } from '@/lib/utils/cn';

type PageTab = 'home' | 'about' | 'contact';

export default function AdminSiteContentPage() {
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Extended CMS state modeled after Template/MATECHFULLPROJECTREPO SiteContentManager.tsx
  const [homeSlides, setHomeSlides] = useState([
    {
      src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      tag: 'Solar & Clean Energy',
      alt: 'Commercial Hybrid Solar Installation Harare',
    },
    {
      src: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80',
      tag: 'Industrial Hardware & Steel',
      alt: 'Structural Steel & Timber Supply Bulawayo',
    },
  ]);

  const [whyReasons, setWhyReasons] = useState([
    {
      title: 'CR14 & ZIMRA Tax Verified',
      body: 'Every listed enterprise undergoes strict corporate registration and physical address verification before receiving our Verified badge.',
    },
    {
      title: '30-Day Free Onboarding Grace',
      body: 'Newly registered Zimbabwean businesses enjoy 1 full month of unrestricted directory and marketplace access before standard $10/mo billing.',
    },
    {
      title: 'Direct WhatsApp & Telephone Trade',
      body: 'Zero middleman commissions on product quotes. Connect directly with verified warehouse desks across all 10 provinces.',
    },
    {
      title: 'Instant ZESA & Bill Settlement',
      body: 'Purchase prepaid ZETDC electricity tokens, settle municipal water accounts, and pay Nyaradzo policies in USD or ZiG.',
    },
  ]);

  const [processSteps, setProcessSteps] = useState([
    {
      step: '01',
      title: 'Search or Filter by Province',
      body: 'Filter verified suppliers, equipment, or job openings across all 10 provinces and 20 commercial sectors.',
    },
    {
      step: '02',
      title: 'Inspect Verified Credentials',
      body: 'Review company CR14 verification status, live USD/ZiG pricing, and physical depot locations.',
    },
    {
      step: '03',
      title: 'Request Quote or Pay Direct',
      body: 'Message the supplier directly on WhatsApp or complete an instant utility bill settlement.',
    },
    {
      step: '04',
      title: 'Fulfilment & Digital Receipt',
      body: 'Receive your official verifiable receipt or dispatch waybill for nationwide delivery.',
    },
  ]);

  const [aboutVision, setAboutVision] = useState(
    'To be Zimbabwe’s most trusted digital commercial infrastructure, connecting every verified enterprise, supplier, and household across all 10 provinces and the global Diaspora.'
  );
  const [aboutMission, setAboutMission] = useState(
    'Eliminating counterfeit supply risk and fragmented directories by providing a single, transparent, CR14-verified commercial network with predictable $10/month business subscriptions.'
  );
  const [coreValues, setCoreValues] = useState([
    {
      title: 'Verification & Trust First',
      body: 'Every supplier profile is audited against corporate registration and physical depot records.',
    },
    {
      title: 'Predictable Flat Pricing',
      body: '30 days free onboarding grace followed by $10/month standard listing and $20/month sponsored promotion.',
    },
    {
      title: 'National 10-Province Reach',
      body: 'From Harare and Bulawayo to Midlands, Manicaland, and Victoria Falls.',
    },
    {
      title: 'Diaspora & Local Accessibility',
      body: 'Dual USD and ZiG pricing transparency with direct WhatsApp and EcoCash/Visa settlement.',
    },
  ]);

  useEffect(() => {
    setSettings(getPlatformSettings());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () => {
    setSaving(true);
    savePlatformSettings(settings);
    setTimeout(() => {
      setSaving(false);
      showToast(`${activeTab.toUpperCase()} page content saved and synced live across the site!`);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-[#0a1018] px-4 py-3 text-xs font-bold text-white shadow-xl border border-[#1e57eb]">
          <CheckCircle2 className="h-4 w-4 text-[#599bff]" />
          <span>{toast}</span>
        </div>
      )}

      <AdminPageHeader
        title="Page Content Management (CMS)"
        description="Directly customize and update copy, headlines, imagery, value propositions, and contact details for the Homepage, About Page, and Contact Page."
      >
        <div className="flex items-center gap-2">
          <AdminButton
            href={activeTab === 'home' ? '/' : `/${activeTab}`}
            target="_blank"
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            Preview {activeTab.toUpperCase()}
          </AdminButton>
          <AdminButton onClick={handleSave} loading={saving} size="sm">
            <Save className="h-4 w-4" />
            Save Changes
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Page Tabs */}
      <div className="flex border-b border-[#c8d2e0]">
        {[
          { id: 'home', label: 'Homepage Content', icon: Home },
          { id: 'about', label: 'About Page Content', icon: Building },
          { id: 'contact', label: 'Contact Page Content', icon: PhoneCall },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as PageTab)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors cursor-pointer',
                isActive
                  ? 'border-[#1e57eb] text-[#1e57eb] bg-white/70'
                  : 'border-transparent text-[#465a7e] hover:text-[#0a1018]'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOMEPAGE CMS */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <Panel>
            <PanelHeading
              title="1. Top Announcement Banner & Commercial Workspace Headlines"
              hint="Controls the live top announcement bar and main commercial workspace copy below the Hero."
            />
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <AdminInput
                  label="Top Announcement Banner Copy"
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  hint="Displayed across the top announcement strip on public pages."
                />
              </div>
              <AdminInput
                label="Platform Brand Name"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
              />
              <AdminInput
                label="Primary CTA Button Label"
                value="Register Your Business (30 Days Free)"
                readOnly
                hint="Linked to the onboarding registration modal."
              />
              <div className="md:col-span-2">
                <AdminTextarea
                  label="Commercial Workspace Tagline & Sub-Headline"
                  rows={2}
                  value={settings.tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, tagline: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Featured Showcase Slides */}
            <div className="mt-8 border-t border-[#e6eaf1] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0a1018]">
                    Featured Commercial Showcase Banners ({homeSlides.length})
                  </h3>
                  <p className="text-xs text-[#6b81a5]">
                    Upload or update promotional showcase imagery from your device.
                  </p>
                </div>
                <AdminButton
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setHomeSlides([
                      ...homeSlides,
                      {
                        src: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
                        tag: 'Agriculture & Irrigation',
                        alt: 'Commercial Agro-Inputs Zimbabwe',
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" /> Add Banner Slide
                </AdminButton>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {homeSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
                        Showcase Slide #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHomeSlides(homeSlides.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <ImageUploader
                      label="Slide Photo"
                      multiple={false}
                      images={slide.src ? [{ src: slide.src, caption: slide.alt }] : []}
                      onChange={(imgs) => {
                        const updated = [...homeSlides];
                        updated[idx] = { ...updated[idx], src: imgs[0]?.src || '' };
                        setHomeSlides(updated);
                      }}
                    />
                    <AdminInput
                      label="Sector Tag"
                      value={slide.tag}
                      onChange={(e) => {
                        const updated = [...homeSlides];
                        updated[idx] = { ...updated[idx], tag: e.target.value };
                        setHomeSlides(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Why Sadza Connect Cards */}
          <Panel>
            <div className="flex items-center justify-between">
              <PanelHeading
                title="2. 'Why Sadza Connect' Trust & Advantage Cards"
                hint="Highlights verification standards, 30-day free grace period, and direct trade."
              />
              <AdminButton
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setWhyReasons([
                    ...whyReasons,
                    { title: 'New Platform Advantage', body: 'Describe key commercial benefit.' },
                  ])
                }
              >
                <Plus className="h-4 w-4" /> Add Reason Card
              </AdminButton>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {whyReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1e57eb]">Card 0{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setWhyReasons(whyReasons.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <AdminInput
                    label="Card Title"
                    value={reason.title}
                    onChange={(e) => {
                      const updated = [...whyReasons];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setWhyReasons(updated);
                    }}
                  />
                  <AdminTextarea
                    label="Description"
                    rows={2}
                    value={reason.body}
                    onChange={(e) => {
                      const updated = [...whyReasons];
                      updated[idx] = { ...updated[idx], body: e.target.value };
                      setWhyReasons(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>

          {/* 4-Step Process Pipeline */}
          <Panel>
            <PanelHeading
              title="3. 'How Sadza Connect Works' 4-Step Pipeline"
              hint="Step-by-step buyer and enterprise workflow."
            />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/50 p-4 space-y-3"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1e57eb] text-xs font-bold text-white">
                    {step.step}
                  </span>
                  <AdminInput
                    label="Step Title"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...processSteps];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setProcessSteps(updated);
                    }}
                  />
                  <AdminTextarea
                    label="Description"
                    rows={3}
                    value={step.body}
                    onChange={(e) => {
                      const updated = [...processSteps];
                      updated[idx] = { ...updated[idx], body: e.target.value };
                      setProcessSteps(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: ABOUT PAGE CMS */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <Panel>
            <PanelHeading
              title="1. About Us Header & Corporate Narrative"
              hint="Displayed on the public /about page."
            />
            <div className="mt-5 space-y-4">
              <AdminInput
                label="About Page Main Headline"
                value={settings.aboutHeadline}
                onChange={(e) => setSettings({ ...settings, aboutHeadline: e.target.value })}
              />
              <AdminTextarea
                label="Corporate Story & Mission Overview"
                rows={4}
                value={settings.aboutMission}
                onChange={(e) => setSettings({ ...settings, aboutMission: e.target.value })}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeading
              title="2. Vision & Mission Statements"
              hint="Featured in the executive dual cards on the About page."
            />
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <AdminTextarea
                label="Our Vision"
                rows={4}
                value={aboutVision}
                onChange={(e) => setAboutVision(e.target.value)}
              />
              <AdminTextarea
                label="Our Mission"
                rows={4}
                value={aboutMission}
                onChange={(e) => setAboutMission(e.target.value)}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeading
              title="3. Core Operational Values (4 Pillars)"
              hint="Defines Sadza Connect's verification and commercial standards."
            />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/50 p-4 space-y-3"
                >
                  <span className="text-xs font-bold text-[#1e57eb]">Pillar #{idx + 1}</span>
                  <AdminInput
                    label="Value Title"
                    value={val.title}
                    onChange={(e) => {
                      const updated = [...coreValues];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setCoreValues(updated);
                    }}
                  />
                  <AdminTextarea
                    label="Description"
                    rows={2}
                    value={val.body}
                    onChange={(e) => {
                      const updated = [...coreValues];
                      updated[idx] = { ...updated[idx], body: e.target.value };
                      setCoreValues(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 3: CONTACT PAGE CMS */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <Panel>
            <PanelHeading
              title="Public Contact Desk & Headquarters Information"
              hint="Synchronizes immediately with the /contact page and global footer."
            />
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminInput
                label="Support & Verification Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <AdminInput
                label="Primary Support Telephone"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              />
              <AdminInput
                label="Official WhatsApp Helpdesk Number"
                value={settings.supportWhatsApp}
                onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
              />
              <AdminInput
                label="Headquarters Physical Address"
                value={settings.hqAddress}
                onChange={(e) =>
                  setSettings({ ...settings, hqAddress: e.target.value })
                }
              />
            </div>
          </Panel>
        </div>
      )}

      <div className="flex justify-end">
        <AdminButton onClick={handleSave} loading={saving} size="lg">
          <Save className="h-4 w-4" />
          Save {activeTab.toUpperCase()} Content
        </AdminButton>
      </div>
    </div>
  );
}
