'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
  Building2,
  QrCode,
  ShieldCheck,
  Award,
  BarChart3,
  Printer,
  Megaphone,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Modal, PublicModalBody, PublicModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  EventItem,
  EventTicketRecord,
  EventExhibitorRecord,
  EventVenueItem,
  EventOrganizerProfile,
  EVENT_CATEGORIES,
  EVENT_ENTRY_TYPES,
  getStoredEvents,
  saveStoredEvent,
  getStoredEventTickets,
  saveStoredEventTicket,
  getStoredEventExhibitors,
  saveStoredEventExhibitor,
  getStoredEventVenues,
  saveStoredEventVenue,
  getStoredEventOrganizers,
  saveStoredEventOrganizer,
} from '@/data/eventsStore';
import { CLEAN_PROVINCES } from '@/data/advertsStore';
import { getCitiesForProvince } from '@/lib/data/zimbabwe';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

type PortalTab = 'events' | 'calendar' | 'venues' | 'organizers' | 'dashboard';

export default function EventsDirectoryPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<EventTicketRecord[]>([]);
  const [exhibitors, setExhibitors] = useState<EventExhibitorRecord[]>([]);
  const [venues, setVenues] = useState<EventVenueItem[]>([]);
  const [organizers, setOrganizers] = useState<EventOrganizerProfile[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedEntryType, setSelectedEntryType] = useState('All Entry Types');

  // Modal State for Viewing Event Details
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Modal State for Ticket Registration & QR Ticket Output
  const [ticketModalEvent, setTicketModalEvent] = useState<EventItem | null>(null);
  const [tktName, setTktName] = useState('');
  const [tktEmail, setTktEmail] = useState('');
  const [tktPhone, setTktPhone] = useState('');
  const [tktTier, setTktTier] = useState<EventTicketRecord['tier']>('General Admission');
  const [tktQty, setTktQty] = useState(1);
  const [tktPayMethod, setTktPayMethod] = useState<EventTicketRecord['paymentMethod']>('EcoCash USD');
  const [issuedTicket, setIssuedTicket] = useState<EventTicketRecord | null>(null);

  // Modal State for Exhibitor & Sponsor Registration
  const [exhibitorModalEvent, setExhibitorModalEvent] = useState<EventItem | null>(null);
  const [exCompany, setExCompany] = useState('');
  const [exContact, setExContact] = useState('');
  const [exEmail, setExEmail] = useState('');
  const [exPhone, setExPhone] = useState('');
  const [exPackage, setExPackage] = useState<EventExhibitorRecord['packageTier']>(
    'Standard Exhibition Booth ($150)'
  );
  const [exSuccess, setExSuccess] = useState<EventExhibitorRecord | null>(null);

  // Modal State for Creating/Submitting Event
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventItem['category']>('Conferences & Summits');
  const [newProvince, setNewProvince] = useState('Harare');
  const [newCity, setNewCity] = useState('Harare CBD');
  const [newVenue, setNewVenue] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM - 04:00 PM CAT');
  const [newEntryType, setNewEntryType] = useState<EventItem['entryType']>('Free Entry');
  const [newTicketPriceUSD, setNewTicketPriceUSD] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newOrganizerType, setNewOrganizerType] =
    useState<EventItem['organizerType']>('Corporate / Chamber');
  const [newDescription, setNewDescription] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('263771000000');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newFeatured, setNewFeatured] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Modal State for Listing an Event Venue
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [venName, setVenName] = useState('');
  const [venProvince, setVenProvince] = useState('Harare');
  const [venCity, setVenCity] = useState('Harare CBD');
  const [venAddress, setVenAddress] = useState('');
  const [venType, setVenType] = useState<EventVenueItem['venueType']>(
    'Conference & Convention Centre'
  );
  const [venCapacity, setVenCapacity] = useState('500');
  const [venPrice, setVenPrice] = useState('450');
  const [venAmenities, setVenAmenities] = useState(
    'PA Sound System, Backup Generator, VIP Lounge, Secure Parking, Catering Kitchen'
  );
  const [venWhatsapp, setVenWhatsapp] = useState('263772100200');

  // Modal State for Registering Verified Event Organiser
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<EventItem['organizerType']>('Corporate / Chamber');
  const [orgProvince, setOrgProvince] = useState('Harare');
  const [orgCity, setOrgCity] = useState('Harare CBD');
  const [orgSpecialty, setOrgSpecialty] = useState('');
  const [orgWhatsapp, setOrgWhatsapp] = useState('263772111000');
  const [orgEmail, setOrgEmail] = useState('');

  useEffect(() => {
    const loadAll = () => {
      setEvents(getStoredEvents());
      setTickets(getStoredEventTickets());
      setExhibitors(getStoredEventExhibitors());
      setVenues(getStoredEventVenues());
      setOrganizers(getStoredEventOrganizers());
    };
    loadAll();
    window.addEventListener('sadza-events-updated', loadAll);
    return () => window.removeEventListener('sadza-events-updated', loadAll);
  }, []);

  const availableFilterCities = useMemo(
    () => getCitiesForProvince(selectedProvince),
    [selectedProvince]
  );

  const availableEventFormCities = useMemo(
    () => getCitiesForProvince(newProvince),
    [newProvince]
  );

  const availableVenueFormCities = useMemo(
    () => getCitiesForProvince(venProvince),
    [venProvince]
  );

  const availableOrgFormCities = useMemo(
    () => getCitiesForProvince(orgProvince),
    [orgProvince]
  );

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

      const matchesCity =
        selectedCity === 'All Cities' ||
        ev.city.toLowerCase() === selectedCity.toLowerCase() ||
        ev.venue.toLowerCase().includes(selectedCity.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All Categories' || ev.category === selectedCategory;

      const matchesEntryType =
        selectedEntryType === 'All Entry Types' || ev.entryType === selectedEntryType;

      return (
        matchesSearch &&
        matchesProvince &&
        matchesCity &&
        matchesCategory &&
        matchesEntryType
      );
    });
  }, [events, searchQuery, selectedProvince, selectedCity, selectedCategory, selectedEntryType]);

  const featuredEvents = useMemo(
    () => filteredEvents.filter((e) => e.featured),
    [filteredEvents]
  );

  const calendarGroups = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const ev of filteredEvents) {
      const group = ev.monthGroup || 'Upcoming Schedule 2026';
      if (!map[group]) map[group] = [];
      map[group].push(ev);
    }
    return Object.entries(map);
  }, [filteredEvents]);

  const totalTicketRevenueUSD = useMemo(() => {
    const fromStored = tickets.reduce((acc, t) => acc + t.totalAmountUSD, 0);
    const fromSeeded = events.reduce(
      (acc, e) => acc + (e.ticketsSoldCount || 0) * (e.ticketPriceUSD || 0),
      0
    );
    return fromStored + fromSeeded;
  }, [tickets, events]);

  const totalTicketsIssued = useMemo(() => {
    const fromStored = tickets.reduce((acc, t) => acc + t.quantity, 0);
    const fromSeeded = events.reduce((acc, e) => acc + (e.ticketsSoldCount || 0), 0);
    return fromStored + fromSeeded;
  }, [tickets, events]);

  const handleOpenTicketModal = (ev: EventItem) => {
    setSelectedEvent(null);
    setTicketModalEvent(ev);
    setIssuedTicket(null);
    setTktTier('General Admission');
    setTktQty(1);
    setTktPayMethod(ev.entryType === 'Free Entry' ? 'Free Registration' : 'EcoCash USD');
  };

  const handleIssueTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketModalEvent || !tktName.trim() || !tktPhone.trim()) return;

    const basePrice =
      ticketModalEvent.entryType === 'Free Entry'
        ? 0
        : tktTier === 'VIP Delegate Pass'
        ? ticketModalEvent.vipTicketPriceUSD || (ticketModalEvent.ticketPriceUSD || 15) * 2.5
        : tktTier === 'Corporate Table (6 Guests)'
        ? (ticketModalEvent.ticketPriceUSD || 20) * 5
        : ticketModalEvent.ticketPriceUSD || 0;

    const totalUSD = Math.round(basePrice * tktQty);
    const ticket: EventTicketRecord = {
      id: `tkt-${Date.now()}`,
      ticketCode: `SC-TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: ticketModalEvent.id,
      eventTitle: ticketModalEvent.title,
      eventDate: `${ticketModalEvent.startDate}${
        ticketModalEvent.endDate !== ticketModalEvent.startDate
          ? ` - ${ticketModalEvent.endDate}`
          : ''
      }`,
      eventVenue: ticketModalEvent.venue,
      eventCity: `${ticketModalEvent.city}, ${ticketModalEvent.province}`,
      attendeeName: tktName.trim(),
      attendeeEmail: tktEmail.trim() || 'attendee@mysadza.co.zw',
      attendeePhone: tktPhone.trim(),
      tier: tktTier,
      quantity: tktQty,
      totalAmountUSD: totalUSD,
      paymentMethod: ticketModalEvent.entryType === 'Free Entry' ? 'Free Registration' : tktPayMethod,
      status: 'Confirmed & QR Issued',
      createdAt: new Date().toLocaleDateString('en-GB'),
    };

    saveStoredEventTicket(ticket);
    setIssuedTicket(ticket);
  };

  const handleRegisterExhibitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exhibitorModalEvent || !exCompany.trim() || !exContact.trim()) return;

    const amount =
      exPackage === 'Gold Headline Sponsor ($1,200)'
        ? 1200
        : exPackage === 'Silver Event Sponsor ($500)'
        ? 500
        : exhibitorModalEvent.exhibitorBoothPriceUSD || 150;

    const rec: EventExhibitorRecord = {
      id: `exh-${Date.now()}`,
      referenceCode: `SC-EXH-${Math.floor(10000 + Math.random() * 90000)}`,
      eventId: exhibitorModalEvent.id,
      eventTitle: exhibitorModalEvent.title,
      companyName: exCompany.trim(),
      contactPerson: exContact.trim(),
      email: exEmail.trim(),
      phone: exPhone.trim(),
      packageTier: exPackage,
      amountUSD: amount,
      status: 'Confirmed',
      createdAt: new Date().toLocaleDateString('en-GB'),
    };

    saveStoredEventExhibitor(rec);
    setExSuccess(rec);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVenue.trim() || !newStartDate.trim()) return;

    const created: EventItem = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newCategory,
      province: newProvince,
      city: newCity.trim() || 'Harare CBD',
      venue: newVenue.trim(),
      startDate: newStartDate.trim(),
      endDate: newEndDate.trim() || newStartDate.trim(),
      monthGroup: 'Upcoming 2026',
      time: newTime.trim() || '09:00 AM - 05:00 PM CAT',
      entryType: newEntryType,
      ticketPriceUSD: newTicketPriceUSD ? Number(newTicketPriceUSD) : undefined,
      ticketPriceZiG: newTicketPriceUSD ? Math.round(Number(newTicketPriceUSD) * 26.5) : undefined,
      organizer: newOrganizer.trim() || 'Verified Event Organiser',
      organizerType: newOrganizerType,
      verifiedOrganizer: true,
      description: newDescription.trim() || 'Join us for this premier Zimbabwean event.',
      bannerImage:
        newBannerImage.trim() ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      attendeesCount: 150,
      ticketsSoldCount: 1,
      exhibitorsCount: 0,
      whatsapp: sanitizePhoneNumber(newWhatsapp),
      websiteUrl: newWebsiteUrl.trim() || undefined,
      featured: newFeatured,
      postedAt: 'Just now',
    };

    saveStoredEvent(created);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setCreateModalOpen(false);
      setNewTitle('');
      setNewVenue('');
      setNewStartDate('');
      setNewDescription('');
    }, 1200);
  };

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venName.trim()) return;
    const created: EventVenueItem = {
      id: `ven-${Date.now()}`,
      name: venName.trim(),
      province: venProvince,
      city: venCity,
      address: venAddress.trim() || `${venCity}, ${venProvince}`,
      venueType: venType,
      capacity: Number(venCapacity) || 300,
      pricePerDayUSD: Number(venPrice) || 400,
      amenities: venAmenities.split(',').map((a) => a.trim()).filter(Boolean),
      whatsapp: sanitizePhoneNumber(venWhatsapp),
      phone: `+${sanitizePhoneNumber(venWhatsapp)}`,
      image:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
      verified: true,
    };
    saveStoredEventVenue(created);
    setVenueModalOpen(false);
    setVenName('');
    setVenAddress('');
  };

  const handleCreateOrganizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    const created: EventOrganizerProfile = {
      id: `org-${Date.now()}`,
      name: orgName.trim(),
      organizerType: orgType,
      province: orgProvince,
      city: orgCity,
      specialty:
        orgSpecialty.trim() ||
        'Conferences, Exhibitions, Concerts, Corporate Summits & Event Management',
      eventsHosted: 1,
      whatsapp: sanitizePhoneNumber(orgWhatsapp),
      email: orgEmail.trim() || 'organiser@mysadza.co.zw',
      verified: true,
    };
    saveStoredEventOrganizer(created);
    setOrgModalOpen(false);
    setOrgName('');
    setOrgSpecialty('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white pt-12 pb-14 px-4 sm:px-6 lg:px-10 border-b border-indigo-900/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_50%)] pointer-events-none" />

          <div className="w-full max-w-[1680px] mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3.5 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
                  <Calendar className="h-3.5 w-3.5 text-indigo-300" />
                  <span>Zimbabwe&apos;s Events, Exhibitions, Conferences &amp; Entertainment Portal.</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  <strong>Discover Events. Connect. Experience Zimbabwe.</strong>
                </h1>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  Find and attend exciting events across Zimbabwe. Discover business expos, conferences, festivals, concerts, exhibitions, sporting events, workshops and networking opportunities. Connect directly with organisers and secure your place.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post an Event / Expo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOrgModalOpen(true)}
                  className="border-indigo-400/40 bg-slate-900/70 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2 cursor-pointer text-xs"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Register as Organiser</span>
                </Button>
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (activeTab !== 'events' && activeTab !== 'calendar') {
                      setActiveTab('events');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Portal Feature Sub-Navigation Tabs */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'events'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>All Events &amp; Tickets ({filteredEvents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'calendar'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Event Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('venues')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'venues'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Event Venues ({venues.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('organizers')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'organizers'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <span>Verified Organisers ({organizers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Attendance &amp; QR Ticket Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="sticky top-20 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs py-4 px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-[1680px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, concert, conference, venue, city..."
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
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedCity('All Cities');
                }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                {CLEAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="All Cities">
                  {selectedProvince === 'All Provinces'
                    ? 'All Cities & Towns'
                    : `All ${selectedProvince} Cities`}
                </option>
                {availableFilterCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {(searchQuery ||
                selectedCategory !== 'All Categories' ||
                selectedEntryType !== 'All Entry Types' ||
                selectedProvince !== 'All Provinces' ||
                selectedCity !== 'All Cities') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSelectedEntryType('All Entry Types');
                    setSelectedProvince('All Provinces');
                    setSelectedCity('All Cities');
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

        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          {/* TAB 1: ALL EVENTS & FEATURED PROMOTIONS */}
          {activeTab === 'events' && (
            <div className="space-y-8">
              {/* Featured & Sponsored Event Spotlight */}
              {featuredEvents.length > 0 && selectedCategory === 'All Categories' && !searchQuery && (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 text-[11px] font-extrabold uppercase tracking-wider">
                        <Megaphone className="h-3.5 w-3.5" /> Featured &amp; Sponsored Events
                      </span>
                      <span className="text-xs text-slate-500">
                        Priority placement for major national expos, concerts &amp; summits
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewFeatured(true);
                        setCreateModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Promote Your Event Here
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {featuredEvents.slice(0, 3).map((ev) => (
                      <div
                        key={`feat-${ev.id}`}
                        className="rounded-xl border border-indigo-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-4 shadow-2xs"
                      >
                        <div className="relative h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                          <Image src={ev.bannerImage} alt={ev.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {ev.category} • {ev.city}
                          </span>
                          <h4
                            onClick={() => setSelectedEvent(ev)}
                            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 cursor-pointer"
                          >
                            {ev.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">{ev.startDate}</p>
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenTicketModal(ev)}
                              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer"
                            >
                              {ev.entryType === 'Free Entry' ? 'Free Pass (QR)' : `Buy Ticket ($${ev.ticketPriceUSD})`}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredEvents.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50">
                  <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No matching events found
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                    Try resetting your category, province, or city filters to discover events happening across Zimbabwe.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Categories');
                      setSelectedEntryType('All Entry Types');
                      setSelectedProvince('All Provinces');
                      setSelectedCity('All Cities');
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
                      <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={event.bannerImage}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-indigo-900/90 text-white backdrop-blur-md border border-white/20">
                            {event.category}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${
                              event.entryType === 'Free Entry'
                                ? 'bg-emerald-500 text-white'
                                : event.entryType === 'Paid Ticket'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-indigo-500 text-white'
                            }`}
                          >
                            {event.entryType}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            <span>
                              {event.startDate}{' '}
                              {event.endDate !== event.startDate ? `- ${event.endDate}` : ''}
                            </span>
                          </div>
                          {event.ticketPriceUSD !== undefined ? (
                            <span className="text-sm font-black text-amber-300">
                              USD ${event.ticketPriceUSD}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-400">Free Entry</span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="truncate">
                              {event.venue} • {event.city}, {event.province}
                            </span>
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

                        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                            <Users className="h-3.5 w-3.5" />
                            <span>{event.attendeesCount.toLocaleString()}+ Attending</span>
                          </div>
                        </div>

                        {/* Organiser Badge & Actions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                                <span className="truncate">{event.organizer}</span>
                                {event.verifiedOrganizer !== false && (
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                )}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                                {event.organizerType} • Verified Organiser
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setExhibitorModalEvent(event);
                                setExSuccess(null);
                              }}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                            >
                              Exhibit / Sponsor
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenTicketModal(event)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-3 shadow-xs transition cursor-pointer"
                            >
                              <Ticket className="h-3.5 w-3.5" />
                              <span>
                                {event.entryType === 'Free Entry'
                                  ? 'Register (Free QR Pass)'
                                  : `Buy QR Ticket ($${event.ticketPriceUSD})`}
                              </span>
                            </button>
                            <a
                              href={`https://wa.me/${event.whatsapp}?text=${encodeURIComponent(
                                `Hello, I would like to inquire about "${event.title}" on MySadza Connect Events.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow-xs"
                              title="WhatsApp Organiser"
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
          )}

          {/* TAB 2: EVENT CALENDAR WITH UPCOMING EVENTS */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Zimbabwe National Event Calendar
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chronological schedule of upcoming conferences, concerts, expos, sports &amp; festivals
                  </p>
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  + Add Event to Calendar
                </Button>
              </div>

              {calendarGroups.map(([month, items]) => (
                <div
                  key={month}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                >
                  <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-bold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                      {month}
                    </span>
                    <span className="text-xs text-slate-400">{items.length} Scheduled Events</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((ev) => (
                      <div
                        key={`cal-${ev.id}`}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-2 text-center shrink-0 min-w-[90px]">
                            <span className="block text-xs font-black text-indigo-700 dark:text-indigo-300">
                              {ev.startDate}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {ev.city}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {ev.category}
                              </span>
                              <span className="text-xs text-slate-500">
                                {ev.venue} • {ev.city}, {ev.province}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {ev.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Organiser: <strong>{ev.organizer}</strong> • {ev.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenTicketModal(ev)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                          >
                            {ev.entryType === 'Free Entry'
                              ? 'Get Free QR Ticket'
                              : `Buy Ticket ($${ev.ticketPriceUSD})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExhibitorModalEvent(ev);
                              setExSuccess(null);
                            }}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                          >
                            Exhibit / Sponsor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: EVENT VENUE LISTINGS */}
          {activeTab === 'venues' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Verified Event Venues Across Zimbabwe
                  </h2>
                  <p className="text-xs text-slate-500">
                    Book conference centres, exhibition parks, stadiums, wedding gardens &amp; banquet halls
                  </p>
                </div>
                <Button
                  onClick={() => setVenueModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  + List an Event Venue
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {venues
                  .filter(
                    (v) =>
                      (selectedProvince === 'All Provinces' || v.province === selectedProvince) &&
                      (selectedCity === 'All Cities' ||
                        v.city.toLowerCase() === selectedCity.toLowerCase())
                  )
                  .map((v) => (
                    <div
                      key={v.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col sm:flex-row"
                    >
                      <div className="relative h-48 sm:h-auto sm:w-56 bg-slate-900 shrink-0">
                        <Image src={v.image} alt={v.name} fill className="object-cover" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-bold">
                          {v.venueType}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {v.city}, {v.province}
                            </span>
                            <span className="text-xs font-black text-emerald-600">
                              From ${v.pricePerDayUSD} USD / day
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                            {v.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">{v.address}</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                            Capacity: Up to {v.capacity.toLocaleString()} Guests / Delegates
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {v.amenities.map((am, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                              >
                                ✓ {am}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified Venue
                          </span>
                          <a
                            href={`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(
                              `Hello, I am inquiring about hiring "${v.name}" (${v.city}) via MySadza Connect Events.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Book Venue on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED EVENT ORGANISERS */}
          {activeTab === 'organizers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Verified Event Organisers &amp; Promoters
                  </h2>
                  <p className="text-xs text-slate-500">
                    Connect with accredited Zimbabwean conference organisers, exhibition hosts &amp; concert promoters
                  </p>
                </div>
                <Button
                  onClick={() => setOrgModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  + Register Organiser Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {organizers.map((org) => (
                  <div
                    key={org.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {org.organizerType}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <ShieldCheck className="h-4 w-4" /> Verified
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {org.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {org.city}, {org.province} • <strong>{org.eventsHosted} Events Hosted</strong>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {org.specialty}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 truncate">{org.email}</span>
                      <a
                        href={`https://wa.me/${org.whatsapp}?text=${encodeURIComponent(
                          `Hello ${org.name}, I found your Verified Organiser profile on MySadza Connect Events.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EVENT ATTENDANCE & TICKET SALES DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Event Attendance, QR Ticket Sales &amp; Exhibitor Dashboard
                </h2>
                <p className="text-xs text-slate-500">
                  Track registered attendees, QR-code e-tickets, ticket sales revenue, and exhibitor booth bookings
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <span className="text-xs font-semibold text-slate-500">Total QR Tickets Issued</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    {totalTicketsIssued.toLocaleString()} Passes
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Free &amp; Paid QR-Verified
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <span className="text-xs font-semibold text-slate-500">Ticket Sales Volume (USD)</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    ${totalTicketRevenueUSD.toLocaleString()} USD
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ~ZiG {(totalTicketRevenueUSD * 26.5).toLocaleString()}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <span className="text-xs font-semibold text-slate-500">Exhibitor &amp; Sponsor Bookings</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {events.reduce((a, e) => a + (e.exhibitorsCount || 0), 0) + exhibitors.length} Booths
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    Across {events.length} active events
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <span className="text-xs font-semibold text-slate-500">Expected National Attendance</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {events.reduce((a, e) => a + e.attendeesCount, 0).toLocaleString()}+
                  </div>
                  <span className="text-[11px] text-slate-400">All 10 Provinces</span>
                </div>
              </div>

              {/* My Recent QR Tickets Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-indigo-600" />
                  <span>Recently Issued QR-Code Tickets &amp; Registrations</span>
                </h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">
                    No tickets booked in this browser session yet. Click <strong>Buy QR Ticket</strong> or{' '}
                    <strong>Register (Free QR Pass)</strong> on any event to generate a verifiable QR-code ticket.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                          <th className="py-2.5 pr-4">QR Ticket Code</th>
                          <th className="py-2.5 pr-4">Event</th>
                          <th className="py-2.5 pr-4">Attendee</th>
                          <th className="py-2.5 pr-4">Tier &amp; Qty</th>
                          <th className="py-2.5 pr-4">Total</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tickets.map((t) => (
                          <tr key={t.id}>
                            <td className="py-3 pr-4 font-bold text-indigo-600">{t.ticketCode}</td>
                            <td className="py-3 pr-4 font-semibold">{t.eventTitle}</td>
                            <td className="py-3 pr-4">{t.attendeeName}</td>
                            <td className="py-3 pr-4">
                              {t.tier} (x{t.quantity})
                            </td>
                            <td className="py-3 pr-4 font-bold text-emerald-600">
                              {t.totalAmountUSD === 0 ? 'FREE' : `$${t.totalAmountUSD} USD`}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const ev = events.find((e) => e.id === t.eventId) || events[0];
                                  setTicketModalEvent(ev);
                                  setIssuedTicket(t);
                                }}
                                className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 cursor-pointer"
                              >
                                View QR Pass
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: EVENT DETAILS */}
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
                    <span>
                      {selectedEvent.startDate} - {selectedEvent.endDate}
                    </span>
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
                  <span>
                    {selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.province} Province
                  </span>
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

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  onClick={() => handleOpenTicketModal(selectedEvent)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <QrCode className="h-4 w-4" />
                  <span>
                    {selectedEvent.entryType === 'Free Entry'
                      ? 'Register for Free QR Ticket'
                      : `Buy Online QR Ticket ($${selectedEvent.ticketPriceUSD})`}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    setExhibitorModalEvent(ev);
                    setExSuccess(null);
                  }}
                  className="text-xs font-bold py-3 px-4 rounded-xl"
                >
                  Book Exhibitor / Sponsor Booth
                </Button>
              </div>
            </div>
          </PublicModalBody>
        </Modal>
      )}

      {/* MODAL 2: ONLINE TICKET SALES & QR-CODE E-TICKET GENERATOR */}
      {ticketModalEvent && (
        <Modal
          isOpen={Boolean(ticketModalEvent)}
          onClose={() => {
            setTicketModalEvent(null);
            setIssuedTicket(null);
          }}
          title={
            issuedTicket
              ? `Official QR E-Ticket — ${issuedTicket.ticketCode}`
              : `Register & Secure Ticket — ${ticketModalEvent.title}`
          }
        >
          <PublicModalBody>
            {issuedTicket ? (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-indigo-600 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-md">
                  <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        MySadza Connect Official Event Pass
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {issuedTicket.eventTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {issuedTicket.eventVenue} • {issuedTicket.eventCity}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {issuedTicket.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ATTENDEE:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {issuedTicket.attendeeName}
                      </span>
                      <span className="block text-slate-500 text-[11px]">
                        {issuedTicket.attendeePhone}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">DATE &amp; PASS TIER:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {issuedTicket.eventDate}
                      </span>
                      <span className="block text-indigo-600 font-semibold text-[11px]">
                        {issuedTicket.tier} (x{issuedTicket.quantity})
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-900">
                        <QrCode className="h-10 w-10" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          QR Gate Verification Code
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {issuedTicket.ticketCode}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-semibold">
                          Present QR at entrance desk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">PAID:</span>
                      <span className="text-base font-black text-emerald-600">
                        {issuedTicket.totalAmountUSD === 0
                          ? 'FREE'
                          : `$${issuedTicket.totalAmountUSD} USD`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print QR Ticket
                  </Button>
                  <Button
                    onClick={() => {
                      setTicketModalEvent(null);
                      setIssuedTicket(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueTicket} className="space-y-4">
                <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-3.5 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {ticketModalEvent.title}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {ticketModalEvent.startDate} • {ticketModalEvent.venue}, {ticketModalEvent.city}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Full Name *</label>
                  <Input
                    required
                    value={tktName}
                    onChange={(e) => setTktName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Email Address *</label>
                    <Input
                      required
                      type="email"
                      value={tktEmail}
                      onChange={(e) => setTktEmail(e.target.value)}
                      placeholder="you@company.co.zw"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Phone / WhatsApp *</label>
                    <Input
                      required
                      value={tktPhone}
                      onChange={(e) => setTktPhone(e.target.value)}
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Ticket Tier</label>
                    <select
                      value={tktTier}
                      onChange={(e) => setTktTier(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                    >
                      <option value="General Admission">General Admission</option>
                      <option value="VIP Delegate Pass">VIP Delegate Pass</option>
                      <option value="Corporate Table (6 Guests)">Corporate Table (6 Guests)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={String(tktQty)}
                      onChange={(e) => setTktQty(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                </div>

                {ticketModalEvent.entryType !== 'Free Entry' && (
                  <div>
                    <label className="block text-xs font-bold mb-1">Payment Method (Paynow Gateway)</label>
                    <select
                      value={tktPayMethod}
                      onChange={(e) => setTktPayMethod(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                    >
                      <option value="EcoCash USD">EcoCash USD / ZiG Push</option>
                      <option value="InnBucks">InnBucks Authorization Code</option>
                      <option value="Visa / Mastercard">Visa / Mastercard</option>
                    </select>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  {ticketModalEvent.entryType === 'Free Entry'
                    ? 'Complete Free Registration & Generate QR Pass'
                    : 'Confirm & Generate QR E-Ticket'}
                </Button>
              </form>
            )}
          </PublicModalBody>
        </Modal>
      )}

      {/* MODAL 3: EXHIBITOR & SPONSOR REGISTRATION */}
      {exhibitorModalEvent && (
        <Modal
          isOpen={Boolean(exhibitorModalEvent)}
          onClose={() => {
            setExhibitorModalEvent(null);
            setExSuccess(null);
          }}
          title={`Exhibitor & Sponsor Registration — ${exhibitorModalEvent.title}`}
        >
          <PublicModalBody>
            {exSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Exhibitor / Sponsor Stand Reserved!
                </h3>
                <p className="text-xs text-slate-500">
                  Reference: <strong>{exSuccess.referenceCode}</strong> • Package:{' '}
                  <strong>{exSuccess.packageTier}</strong>
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${exhibitorModalEvent.whatsapp}?text=${encodeURIComponent(
                      `Hello, we have reserved ${exSuccess.packageTier} (Ref: ${exSuccess.referenceCode}) for "${exhibitorModalEvent.title}" under ${exSuccess.companyName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    <MessageCircle className="h-4 w-4" /> Confirm Stand Layout with Organiser on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterExhibitor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Company / Organisation Name *</label>
                  <Input
                    required
                    value={exCompany}
                    onChange={(e) => setExCompany(e.target.value)}
                    placeholder="e.g. SolarTech Zimbabwe (Pvt) Ltd"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Contact Person *</label>
                    <Input
                      required
                      value={exContact}
                      onChange={(e) => setExContact(e.target.value)}
                      placeholder="e.g. Rudo Ndlovu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Phone / WhatsApp *</label>
                    <Input
                      required
                      value={exPhone}
                      onChange={(e) => setExPhone(e.target.value)}
                      placeholder="+263 77 200 3000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Corporate Email *</label>
                  <Input
                    required
                    type="email"
                    value={exEmail}
                    onChange={(e) => setExEmail(e.target.value)}
                    placeholder="marketing@company.co.zw"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Exhibition / Sponsorship Tier</label>
                  <select
                    value={exPackage}
                    onChange={(e) => setExPackage(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  >
                    <option value="Standard Exhibition Booth ($150)">
                      Standard Exhibition Booth (3m x 3m Shell Scheme — $150 USD)
                    </option>
                    <option value="Silver Event Sponsor ($500)">
                      Silver Event Sponsor (Pavilion Stand + Stage Branding — $500 USD)
                    </option>
                    <option value="Gold Headline Sponsor ($1,200)">
                      Gold Headline Sponsor (Keynote Slot + VIP Double Pavilion — $1,200 USD)
                    </option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  Reserve Exhibitor / Sponsor Package
                </Button>
              </form>
            )}
          </PublicModalBody>
        </Modal>
      )}

      {/* MODAL 4: SUBMIT EVENT */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Post an Event, Conference, Concert or Exhibition"
        >
          <PublicModalBody>
            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-indigo-600 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Event Published Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your event is now live on Zimbabwe&apos;s Events, Exhibitions, Conferences &amp; Entertainment Portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Event Title *</label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Harare Tech & Innovation Summit 2026"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Event Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                    >
                      {EVENT_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Entry / Ticket Type *</label>
                    <select
                      value={newEntryType}
                      onChange={(e) => setNewEntryType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
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
                    <label className="block text-xs font-bold mb-1">Province *</label>
                    <select
                      value={newProvince}
                      onChange={(e) => {
                        const prov = e.target.value;
                        setNewProvince(prov);
                        const cities = getCitiesForProvince(prov);
                        if (cities[0]) setNewCity(cities[0]);
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                    >
                      {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">City / Town *</label>
                    <select
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                    >
                      {availableEventFormCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Venue Name *</label>
                    <Input
                      required
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      placeholder="e.g. HICC / ZITF Grounds"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Start Date *</label>
                    <Input
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      placeholder="e.g. 21 Aug 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">End Date</label>
                    <Input
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      placeholder="e.g. 23 Aug 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Ticket Price (USD)</label>
                    <Input
                      type="number"
                      value={newTicketPriceUSD}
                      onChange={(e) => setNewTicketPriceUSD(e.target.value)}
                      placeholder="0 if Free"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Description &amp; Highlights *</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Speakers, performers, exhibition booths, networking opportunities..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Organiser Name *</label>
                    <Input
                      required
                      value={newOrganizer}
                      onChange={(e) => setNewOrganizer(e.target.value)}
                      placeholder="e.g. Zambezi Live Events"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">WhatsApp Contact *</label>
                    <Input
                      required
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="e.g. 263772111000"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>Feature this event in the Sponsored Events Spotlight</span>
                </label>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  Publish Event Listing
                </Button>
              </form>
            )}
          </PublicModalBody>
        </Modal>
      )}

      {/* MODAL 5: LIST AN EVENT VENUE */}
      {venueModalOpen && (
        <Modal
          isOpen={venueModalOpen}
          onClose={() => setVenueModalOpen(false)}
          title="List an Event Venue or Conference Facility"
        >
          <PublicModalBody>
            <form onSubmit={handleCreateVenue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Venue Name *</label>
                <Input
                  required
                  value={venName}
                  onChange={(e) => setVenName(e.target.value)}
                  placeholder="e.g. Jacaranda Gardens & Conference Centre"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Province *</label>
                  <select
                    value={venProvince}
                    onChange={(e) => {
                      const prov = e.target.value;
                      setVenProvince(prov);
                      const cities = getCitiesForProvince(prov);
                      if (cities[0]) setVenCity(cities[0]);
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  >
                    {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">City / Town *</label>
                  <select
                    value={venCity}
                    onChange={(e) => setVenCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  >
                    {availableVenueFormCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Max Guest Capacity *</label>
                  <Input
                    type="number"
                    required
                    value={venCapacity}
                    onChange={(e) => setVenCapacity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Hire Rate per Day (USD) *</label>
                  <Input
                    type="number"
                    required
                    value={venPrice}
                    onChange={(e) => setVenPrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Booking WhatsApp *</label>
                <Input
                  required
                  value={venWhatsapp}
                  onChange={(e) => setVenWhatsapp(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl"
              >
                Publish Verified Venue
              </Button>
            </form>
          </PublicModalBody>
        </Modal>
      )}

      {/* MODAL 6: REGISTER VERIFIED EVENT ORGANISER */}
      {orgModalOpen && (
        <Modal
          isOpen={orgModalOpen}
          onClose={() => setOrgModalOpen(false)}
          title="Register as a Verified Event Organiser"
        >
          <PublicModalBody>
            <form onSubmit={handleCreateOrganizer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Organiser / Company Name *</label>
                <Input
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Pinnacle Events & Exhibitions Zimbabwe"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Province *</label>
                  <select
                    value={orgProvince}
                    onChange={(e) => {
                      const prov = e.target.value;
                      setOrgProvince(prov);
                      const cities = getCitiesForProvince(prov);
                      if (cities[0]) setOrgCity(cities[0]);
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  >
                    {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">City / Town *</label>
                  <select
                    value={orgCity}
                    onChange={(e) => setOrgCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  >
                    {availableOrgFormCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Event Specialties *</label>
                <Input
                  required
                  value={orgSpecialty}
                  onChange={(e) => setOrgSpecialty(e.target.value)}
                  placeholder="Conferences, Concerts, Weddings, Trade Fairs, Sports..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Official Email *</label>
                  <Input
                    required
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    placeholder="info@organiser.co.zw"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">WhatsApp Desk *</label>
                  <Input
                    required
                    value={orgWhatsapp}
                    onChange={(e) => setOrgWhatsapp(e.target.value)}
                    placeholder="263772111000"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl"
              >
                Create Verified Organiser Profile
              </Button>
            </form>
          </PublicModalBody>
        </Modal>
      )}

      <Footer />
    </div>
  );
}
