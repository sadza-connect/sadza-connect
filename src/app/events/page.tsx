'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Search,
  Plus,
  Users,
  Clock,
  Ticket,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Sparkles,
  X,
  Share2,
  Building2,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Modal, PublicModalBody, PublicModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  EventItem,
  EVENT_CATEGORIES,
  EVENT_ENTRY_TYPES,
  getStoredEvents,
  saveStoredEvent,
} from '@/data/eventsStore';
import { CLEAN_PROVINCES } from '@/data/advertsStore';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

export default function EventsDirectoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedEntryType, setSelectedEntryType] = useState('All Entry Types');

  // Modal State for Viewing Event Details
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Modal State for Creating/Submitting Event
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventItem['category']>('Expos & Trade Fairs');
  const [newProvince, setNewProvince] = useState('Harare');
  const [newCity, setNewCity] = useState('Harare');
  const [newVenue, setNewVenue] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM - 04:00 PM CAT');
  const [newEntryType, setNewEntryType] = useState<EventItem['entryType']>('Free Entry');
  const [newTicketPriceUSD, setNewTicketPriceUSD] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newOrganizerType, setNewOrganizerType] = useState<EventItem['organizerType']>('Corporate / Chamber');
  const [newDescription, setNewDescription] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('263771000000');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadEventsData = () => {
      setEvents(getStoredEvents());
      setIsLoading(false);
    };
    loadEventsData();
    window.addEventListener('sadza-events-updated', loadEventsData);
    return () => window.removeEventListener('sadza-events-updated', loadEventsData);
  }, []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((ev) => {
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q);

      const matchesProvince =
        selectedProvince === 'All Provinces' || ev.province === selectedProvince;

      const matchesCategory =
        selectedCategory === 'All Categories' || ev.category === selectedCategory;

      const matchesEntryType =
        selectedEntryType === 'All Entry Types' || ev.entryType === selectedEntryType;

      return matchesSearch && matchesProvince && matchesCategory && matchesEntryType;
    });
  }, [events, searchQuery, selectedProvince, selectedCategory, selectedEntryType]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVenue.trim() || !newStartDate.trim()) return;

    const created: EventItem = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newCategory,
      province: newProvince,
      city: newCity.trim() || 'Harare',
      venue: newVenue.trim(),
      startDate: newStartDate.trim(),
      endDate: newEndDate.trim() || newStartDate.trim(),
      time: newTime.trim() || '09:00 AM - 05:00 PM CAT',
      entryType: newEntryType,
      ticketPriceUSD: newTicketPriceUSD ? Number(newTicketPriceUSD) : undefined,
      ticketPriceZiG: newTicketPriceUSD ? Number(newTicketPriceUSD) * 26.5 : undefined,
      organizer: newOrganizer.trim() || 'Event Organizing Committee',
      organizerType: newOrganizerType,
      description: newDescription.trim() || 'Join us for this premier Zimbabwean event.',
      bannerImage:
        newBannerImage.trim() ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      attendeesCount: 250,
      whatsapp: sanitizePhoneNumber(newWhatsapp),
      websiteUrl: newWebsiteUrl.trim() || undefined,
      featured: false,
      postedAt: 'Just now',
    };

    saveStoredEvent(created);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewVenue('');
      setNewStartDate('');
      setNewDescription('');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-10 border-b border-indigo-900/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_50%)] pointer-events-none" />

          <div className="w-full max-w-[1680px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Dedicated Events, Expos &amp; Summits Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Events &amp; Expos in Zimbabwe
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Discover trade fairs, mining summits, agricultural field days, SME workshops, and business networking conferences across Zimbabwe. Connect directly with organizers and book attendance.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit an Event / Expo</span>
                </Button>
              </div>
            </div>

            {/* Event Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Upcoming Events</div>
                <div className="text-xl sm:text-2xl font-black text-indigo-400">{events.length} Expos &amp; Meets</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Nationwide Coverage</div>
                <div className="text-xl sm:text-2xl font-black text-white">10 Provinces</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Direct Inquiries</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">WhatsApp Desk</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Admission Options</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300">Free &amp; Paid</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="sticky top-20 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs py-4 px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-[1680px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expo, mining, summit, venue, host..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedEntryType}
                onChange={(e) => setSelectedEntryType(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {EVENT_ENTRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {CLEAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>

              {(searchQuery || selectedCategory !== 'All Categories' || selectedEntryType !== 'All Entry Types' || selectedProvince !== 'All Provinces') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSelectedEntryType('All Entry Types');
                    setSelectedProvince('All Provinces');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Upcoming Events &amp; Expos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {filteredEvents.length} scheduled events across Zimbabwe
              </p>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50">
              <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No matching events found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Try resetting your category or province filters to discover events happening in other parts of Zimbabwe.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedEntryType('All Entry Types');
                  setSelectedProvince('All Provinces');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Banner Image Cover */}
                  <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={event.bannerImage}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-indigo-900/90 text-white backdrop-blur-md border border-white/20">
                        {event.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${
                        event.entryType === 'Free Entry'
                          ? 'bg-emerald-500 text-white'
                          : event.entryType === 'Paid Ticket'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-indigo-500 text-white'
                      }`}>
                        {event.entryType}
                      </span>
                    </div>

                    {/* Date Tag Overlay in Cover */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1.5 text-xs font-bold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{event.startDate} {event.endDate !== event.startDate ? `- ${event.endDate}` : ''}</span>
                      </div>
                      {event.ticketPriceUSD !== undefined ? (
                        <div className="text-right">
                          <span className="text-sm font-black text-amber-300">
                            USD ${event.ticketPriceUSD}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400">Admission Free</span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{event.venue}, {event.city} ({event.province})</span>
                      </div>

                      <h3
                        onClick={() => setSelectedEvent(event)}
                        className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Details Snippet */}
                    <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                        <Users className="h-3.5 w-3.5" />
                        <span>{event.attendeesCount.toLocaleString()}+ Expected</span>
                      </div>
                    </div>

                    {/* Organizer & Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                          {event.organizer}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                          {event.organizerType}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(event)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Details
                        </button>
                        <a
                          href={`https://wa.me/${event.whatsapp}?text=${encodeURIComponent(
                            `Hello, I would like to inquire about attending/exhibiting at "${event.title}" on Sadza Connect.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-transform active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
        >
          <PublicModalBody>
            <div className="space-y-5">
              <div className="relative h-60 w-full rounded-xl overflow-hidden bg-slate-900">
                <Image
                  src={selectedEvent.bannerImage}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-indigo-900/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedEvent.category}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{selectedEvent.startDate} - {selectedEvent.endDate}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedEvent.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedEvent.ticketPriceUSD !== undefined
                      ? `USD $${selectedEvent.ticketPriceUSD} / Ticket`
                      : 'Free Entry'}
                  </div>
                  {selectedEvent.ticketPriceZiG && (
                    <div className="text-xs text-amber-600 font-semibold">
                      ~ZiG {selectedEvent.ticketPriceZiG.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Venue &amp; Location
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>{selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.province} Province</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  About this Event
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedEvent.organizer}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedEvent.organizerType}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedEvent.websiteUrl && (
                    <a
                      href={selectedEvent.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                      title="Visit Official Website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${selectedEvent.whatsapp}?text=${encodeURIComponent(
                      `Hello, I would like to register or inquire about "${selectedEvent.title}" on Sadza Connect.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact Organizer</span>
                  </a>
                </div>
              </div>
            </div>
          </PublicModalBody>
        </Modal>
      )}

      {/* Submit Event Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Submit an Event, Expo or Business Forum"
        >
          <PublicModalBody>
            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-indigo-600 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Event Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your event is now listed on Sadza Connect Events &amp; Expos Directory.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Title *
                  </label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Zimbabwe Agricultural Field Day 2026"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Event Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {EVENT_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Entry / Ticket Type *
                    </label>
                    <select
                      value={newEntryType}
                      onChange={(e) => setNewEntryType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {EVENT_ENTRY_TYPES.filter((t) => t !== 'All Entry Types').map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Province *
                    </label>
                    <select
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Town *
                    </label>
                    <Input
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Bulawayo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Venue Name *
                    </label>
                    <Input
                      required
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      placeholder="e.g. ZITF Grounds"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date *
                    </label>
                    <Input
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      placeholder="e.g. 21 Apr 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <Input
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      placeholder="e.g. 25 Apr 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ticket Price (USD)
                    </label>
                    <Input
                      type="number"
                      value={newTicketPriceUSD}
                      onChange={(e) => setNewTicketPriceUSD(e.target.value)}
                      placeholder="Leave blank if free"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Highlights *
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide overview of guest speakers, exhibition opportunities, or program..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Organizer Name *
                    </label>
                    <Input
                      required
                      value={newOrganizer}
                      onChange={(e) => setNewOrganizer(e.target.value)}
                      placeholder="e.g. Ministry of Industry / Chamber of SMEs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Contact *
                    </label>
                    <Input
                      required
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="e.g. 263772111000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <Input
                    value={newBannerImage}
                    onChange={(e) => setNewBannerImage(e.target.value)}
                    placeholder="https://... (Leave blank for default banner)"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                  >
                    Publish Event Listing
                  </Button>
                </div>
              </form>
            )}
          </PublicModalBody>
        </Modal>
      )}

      <Footer />
    </div>
  );
}
