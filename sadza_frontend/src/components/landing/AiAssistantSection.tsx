'use client';

import { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Building2,
  MapPin,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  recommendations?: Array<{
    title: string;
    category: string;
    city: string;
    specialty: string;
    whatsapp: string;
  }>;
}

const SAMPLE_PROMPTS = [
  'Where can I find 5kVA solar systems in Gweru?',
  'Recommend traditional sadza spots open in Harare',
  'How does CR14 verification protect buyers?',
  'What farm input suppliers sell Compound D fertilizer in bulk?',
];

export function AiAssistantSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Salibonani! Mhoro! Welcome to Sadza AI. I can help you locate verified Zimbabwean businesses, compare marketplace prices in USD/ZiG, or check open job vacancies across all 10 provinces. What can I find for you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse: Message;

      if (query.toLowerCase().includes('solar') || query.toLowerCase().includes('gweru')) {
        aiResponse = {
          sender: 'ai',
          text: 'Here are the top-rated, CR14-verified solar suppliers in the Midlands Province with in-stock Tier-1 hybrid systems:',
          recommendations: [
            {
              title: 'Midlands Solar & Power Systems',
              category: 'Solar & Renewable',
              city: 'Gweru (Robert Mugabe Way)',
              specialty: 'Deye 5kVA Inverters + 5.12kWh Lithium Batteries in stock',
              whatsapp: '263773333444',
            },
            {
              title: 'Africdominion Clean Energy',
              category: 'Solar & Inverters',
              city: 'Gweru & Harare Hubs',
              specialty: 'Growatt Hybrid Inverters & Solar Borehole Pump kits',
              whatsapp: '263771234567',
            },
          ],
        };
      } else if (query.toLowerCase().includes('sadza') || query.toLowerCase().includes('harare') || query.toLowerCase().includes('belgravia')) {
        aiResponse = {
          sender: 'ai',
          text: 'For authentic traditional dining in Harare, here is the #1 recommended verified dining spot:',
          recommendations: [
            {
              title: "Gava's Traditional Restaurant",
              category: 'Restaurants & Traditional Dining',
              city: 'Belgravia, Harare',
              specialty: 'Sadza rezviyo, Road runner chicken, Stewed oxtail & Covo',
              whatsapp: '263772111222',
            },
          ],
        };
      } else if (query.toLowerCase().includes('cr14') || query.toLowerCase().includes('protect') || query.toLowerCase().includes('verify')) {
        aiResponse = {
          sender: 'ai',
          text: 'On Sadza Connect, our Two-Tier Verification System validates official incorporation documents (CR14/CR6, Certificate of Incorporation, and ZIMRA ITF263 Tax Clearance). This ensures you are dealing with genuine registered legal entities, eliminating fly-by-night scams and phantom merchants.',
        };
      } else {
        aiResponse = {
          sender: 'ai',
          text: `I found multiple verified listings matching "${query}". You can browse our live directory or tap below to filter by province and ratings.`,
          recommendations: [
            {
              title: 'Batanai Building & Hardware',
              category: 'Construction & Hardware',
              city: 'Bulawayo & Gweru',
              specialty: 'PPC Cement & Structural Steel supplies',
              whatsapp: '263775666777',
            },
          ],
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <section id="ai-assistant" className="py-20 bg-white dark:bg-ink-950 transition-colors">
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Explanation */}
          <div className="lg:col-span-5 space-y-5">
            <SectionHeading
              eyebrow="AI-Powered Discovery"
              title="Meet Sadza AI: Your Local Zimbabwean Guide"
              description="Speak naturally to search across thousands of enterprises, compare prices in USD or ZiG, and discover services in your neighborhood."
            />

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-ink-700 dark:text-ink-300">
              <div className="flex items-start gap-3 rounded-xl border border-ink-200 dark:border-ink-800 p-3 bg-ink-50/50 dark:bg-ink-900/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 dark:text-white">Understands Local Context</h4>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Recognizes Shona, Ndebele, and local Zimbabwean terminology (Sadza rezviyo, ZESA tokens, boreholes, combis, kombis).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-ink-200 dark:border-ink-800 p-3 bg-ink-50/50 dark:bg-ink-900/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 dark:text-white">Prioritizes Verified Merchants</h4>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Only recommends businesses holding active registration and valid director records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-ink-200 dark:border-ink-800 p-3 bg-ink-50/50 dark:bg-ink-900/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ruby-500/10 text-ruby-600 dark:text-ruby-400 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 dark:text-white">Direct WhatsApp Hand-Off</h4>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Jump straight from AI answer to the business owner&rsquo;s WhatsApp chat.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Sample Prompts */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500">
                Tap to Try:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {SAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 px-3 py-1.5 text-xs text-left font-medium text-ink-700 dark:text-ink-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shadow-sm"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Interactive Chat Simulator Card */}
          <div className="lg:col-span-7 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-2xl overflow-hidden flex flex-col h-[560px]">
            {/* Chat Top Bar */}
            <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 px-5 py-3.5 bg-ink-50/80 dark:bg-ink-900/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-emerald">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-ink-900" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-sm font-bold text-ink-950 dark:text-white">
                      Sadza AI Assistant
                    </h4>
                    <span className="rounded-md bg-gold-400/20 text-gold-700 dark:text-gold-400 px-1.5 py-0.2 text-[10px] font-bold">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400">
                    Zimbabwe Local Knowledge Engine
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-ink-400">v1.0 Assistant</span>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100 rounded-tl-none border border-ink-200/80 dark:border-ink-700'
                  }`}>
                    <p>{m.text}</p>

                    {/* AI Inlined Recommendations */}
                    {m.recommendations && m.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-ink-200 dark:border-ink-700">
                        {m.recommendations.map((rec, rIdx) => (
                          <div
                            key={rIdx}
                            className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-ink-900 dark:text-white"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold">{rec.title}</span>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              </div>
                              <p className="text-[11px] text-ink-500 dark:text-ink-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-brand-600" />
                                {rec.city}
                              </p>
                              <p className="text-[11px] text-brand-700 dark:text-brand-400 font-medium mt-1">
                                {rec.specialty}
                              </p>
                            </div>

                            <a
                              href={`https://wa.me/${rec.whatsapp}?text=Hi,%20I%20found%20you%20via%20Sadza%20AI`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-ink-400 dark:text-ink-500 pl-11">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Sadza AI is searching Zimbabwean directory...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-950/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about businesses, solar packages, sadza, jobs or ZESA..."
                className="flex-1 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 py-2.5 px-4 text-xs sm:text-sm text-ink-900 dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-500 focus:outline-none focus:border-brand-500"
              />
              <Button type="submit" variant="primary" size="md" className="shrink-0 px-4">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
