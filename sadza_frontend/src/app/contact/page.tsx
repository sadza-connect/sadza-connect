'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/utils/whatsapp';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const directWhatsAppLink = generateWhatsAppLink(
    '263771000000',
    'Hello Sadza Connect Team, I am contacting you through the website support desk.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container-x max-w-5xl">
          <div className="max-w-2xl mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-3">
              <Mail className="w-3.5 h-3.5 text-gold-500" />
              Customer Support & Inquiries
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Get in Touch with Sadza Connect
            </h1>
            <p className="mt-2 text-base text-ink-600 dark:text-ink-300">
              Have questions regarding listing your enterprise, verification KYC, advertising tiers, or utility bill settlements? We are here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-6">
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" />
                  <h3 className="text-lg font-bold">Message Dispatched!</h3>
                  <p className="text-xs text-ink-500">
                    A representative from our Gweru or Harare support desk will contact you within 2 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai Chikore"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tendai@example.co.zw"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+263 77 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Your Message or Inquiry
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help your business thrive?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-ink-950 dark:text-white">
                  Headquarters & Regional Offices
                </h3>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-ink-900 dark:text-white">Gweru Office</div>
                      <div className="text-ink-600 dark:text-ink-300">Africdominion Tower, 5th Street, Gweru, Midlands</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-ink-900 dark:text-white">Harare Hub</div>
                      <div className="text-ink-600 dark:text-ink-300">Eastlea Commercial Park, Samora Machel Ave, Harare</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-ink-900 dark:text-white">Support Operating Hours</div>
                      <div className="text-ink-600 dark:text-ink-300">Monday - Friday: 08:00 - 17:00 CAT</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                  <a
                    href={directWhatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Instant WhatsApp Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
