import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Tag,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  Truck,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { SAMPLE_PRODUCTS } from '@/lib/data/zimbabwe';
import { formatDualCurrency, DEFAULT_USD_TO_ZIG_RATE } from '@/lib/utils/currency';
import { createProductInquiryLink } from '@/lib/utils/whatsapp';

interface Props {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = SAMPLE_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const { usd, zig } = formatDualCurrency(product.priceUsd);
  const whatsappLink = createProductInquiryLink(product.title, product.priceUsd, product.sellerPhone);

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container-x">
          <div className="mb-6">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Product Information */}
            <div className="lg:col-span-8 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {product.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                  {product.condition}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-950 dark:text-white">
                {product.title}
              </h1>

              {/* Price Banner */}
              <div className="p-5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60">
                <div className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                  Direct Cash / Transfer Price
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-brand-700 dark:text-brand-400">
                    {usd}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-gold-600 dark:text-gold-400">
                    ({zig})
                  </span>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">
                  Exchange rate pegged at 1 USD = {DEFAULT_USD_TO_ZIG_RATE} ZiG. EcoCash USD, InnBucks, and Cash USD accepted.
                </p>
              </div>

              {/* Product specifications & highlights */}
              <div className="space-y-3 pt-4 border-t border-ink-100 dark:border-ink-800">
                <h3 className="text-base font-bold text-ink-900 dark:text-white">Product Highlights</h3>
                <ul className="space-y-2 text-sm text-ink-600 dark:text-ink-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Genuine Zimbabwean merchant item guaranteed as described</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Inspection permitted upon collection or local delivery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Available at {product.location}</span>
                  </li>
                </ul>
              </div>

              {/* Delivery notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-100 dark:border-ink-800 text-xs sm:text-sm text-ink-600 dark:text-ink-300">
                <Truck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-ink-900 dark:text-white">Nationwide Delivery Available</div>
                  <div>Delivery via local courier services across all 10 provinces can be arranged directly with the seller.</div>
                </div>
              </div>
            </div>

            {/* Right Col: Seller Card & Purchase Action */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">
                  Merchant / Seller Info
                </h3>

                <div>
                  <div className="flex items-center gap-1.5 font-extrabold text-base text-ink-900 dark:text-white">
                    {product.sellerVerified && (
                      <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    )}
                    <span>{product.sellerName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-ink-500">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{product.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Order via WhatsApp</span>
                  </a>
                  <p className="text-[11px] text-center text-ink-400 mt-2">
                    Direct instant chat with the seller. No intermediary commission fees.
                  </p>
                </div>
              </div>

              {/* Safety notice */}
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-5 text-xs text-amber-900 dark:text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Buyer Safety Tips</span>
                </div>
                <p>
                  Always verify goods before releasing payment. For high-value transactions, meet at the merchant’s verified trading premises or physical shop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
