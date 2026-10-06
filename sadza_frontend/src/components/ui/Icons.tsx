'use client';

import React from 'react';
import {
  ShieldCheck,
  Building2,
  User,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  MapPin,
  FileText,
  Receipt,
  Check,
  Search,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Smartphone,
  CreditCard,
  Building,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Sun,
  Moon,
  Star,
  Clock,
  Compass,
  Utensils,
  Hammer,
  Car,
  Sprout,
  Activity,
} from 'lucide-react';

// Re-export standard, pixel-perfect Lucide React icons with consistent naming
export const ShieldCheckIcon = ShieldCheck;
export const BuildingIcon = Building2;
export const UserIcon = User;
export const LockIcon = Lock;
export const MailIcon = Mail;
export const PhoneIcon = Phone;
export const CheckCircleIcon = CheckCircle2;
export const ArrowRightIcon = ArrowRight;
export const ArrowLeftIcon = ArrowLeft;
export const EyeIcon = Eye;
export const EyeOffIcon = EyeOff;
export const MapPinIcon = MapPin;
export const FileTextIcon = FileText;
export const ReceiptIcon = Receipt;
export const CheckIcon = Check;
export const SearchIcon = Search;
export const BriefcaseIcon = Briefcase;
export const AlertCircleIcon = AlertCircle;
export const HelpCircleIcon = HelpCircle;
export const ExternalLinkIcon = ExternalLink;
export const PlusCircleIcon = PlusCircle;
export const SparklesIcon = Sparkles;
export { Sparkles };
export const SmartphoneIcon = Smartphone;
export const CreditCardIcon = CreditCard;
export const CorporateBuildingIcon = Building;
export const ChevronDownIcon = ChevronDown;
export const ChevronRightIcon = ChevronRight;
export const CloseIcon = X;
export const MenuIcon = Menu;
export const SunIcon = Sun;
export const MoonIcon = Moon;
export const StarIcon = Star;
export const ClockIcon = Clock;
export const CompassIcon = Compass;
export const UtensilsIcon = Utensils;
export const HammerIcon = Hammer;
export const CarIcon = Car;
export const SproutIcon = Sprout;
export const ActivityIcon = Activity;

// Authentic Official Google Brand Icon (Official Brand SVG)
export function GoogleIcon({ size = 18, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Authentic Official WhatsApp Brand Icon (Official Brand Vector)
export function WhatsAppIcon({ size = 18, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.411z" />
    </svg>
  );
}
