# 🍎 Mevcut Apple-Style Tasarım Kodları

Bu dosya, projedeki tüm Apple-style tasarım component'lerinin ve sayfalarının kodlarını içerir.

---

## 📁 Dosya Yapısı

```
app/
├── globals.css                    # Global Apple-style CSS
├── page.tsx                      # Homepage
├── layout.tsx                     # Root layout
├── auth/
│   ├── login/page.tsx            # Login sayfası
│   └── register/page.tsx        # Register sayfası
└── dashboard/
    └── DashboardContent.tsx      # Dashboard sayfası

components/ui/
├── NavbarApple.tsx               # Navbar component
├── HeroApple.tsx                 # Hero section
├── FeatureCardApple.tsx          # Feature cards
├── Button.tsx                    # Button component
├── Input.tsx                     # Input component
├── DashboardMetricCardApple.tsx  # Metric cards
├── TableApple.tsx                # Table container
├── AuthFormApple.tsx             # Auth form wrapper
├── PageContainer.tsx             # Page wrapper
└── ImportantNoticeCard.tsx       # Notice card

components/
└── LanguageSelector.tsx          # Language switcher
```

---

## 🎨 1. Global CSS (app/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Apple-Style Color Palette */
  --apple-bg: #FAFAFA;
  --apple-surface: #FFFFFF;
  --apple-border: rgba(0, 0, 0, 0.08);
  --apple-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  --apple-text-primary: #1D1D1F;
  --apple-text-secondary: #666666;
  --apple-text-tertiary: #86868B;
  --apple-blue: rgba(59, 130, 246, 0.7);
  --apple-purple: rgba(139, 92, 246, 0.6);
  --apple-green: rgba(34, 197, 94, 0.6);
  --apple-yellow: rgba(234, 179, 8, 0.6);
}

body {
  color: var(--apple-text-primary);
  background: var(--apple-bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.01em;
}

/* Apple Typography */
h1 {
  font-size: 3rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--apple-text-primary);
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--apple-text-primary);
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--apple-text-primary);
}

/* Apple Card */
.apple-card {
  background: var(--apple-surface);
  border: 1px solid var(--apple-border);
  border-radius: 1.5rem;
  box-shadow: var(--apple-shadow);
  padding: 2rem;
}

/* Apple Transitions */
.apple-transition {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🧩 2. Component'ler

### Button Component (components/ui/Button.tsx)

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-full transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[linear-gradient(135deg,#4F8AF7_0%,#3B82F6_100%)] text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] active:scale-[0.98]',
    secondary: 'bg-white border border-black/10 text-black/70 hover:bg-black/5 active:scale-[0.98]',
    tertiary: 'text-black/50 hover:text-black/70 active:opacity-70'
  };
  
  const sizes = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Input Component (components/ui/Input.tsx)

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2.5">
      {label && (
        <label className="block text-sm font-semibold text-black/70">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-white border border-black/10 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          'transition-all duration-200 text-black/90 placeholder-black/30',
          'hover:border-black/20',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
```

### NavbarApple (components/ui/NavbarApple.tsx)

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/lib/i18n/context';

export function NavbarApple() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const { t } = useI18n();

  if (isAuthPage) return null;

  return (
    <nav className="bg-white border-b border-black/5 sticky top-0 z-50 backdrop-blur-xl bg-white/80">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[linear-gradient(135deg,#4F8AF7_0%,#3B82F6_100%)] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(59,130,246,0.2)] group-hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-shadow">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <span className="text-lg font-semibold text-black/90 tracking-tight">{t('app.name')}</span>
          </Link>
          
          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link href="/auth/login">
              <Button variant="tertiary" size="sm">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### HeroApple (components/ui/HeroApple.tsx)

```tsx
'use client';

import Link from 'next/link';
import { Button } from './Button';
import { useI18n } from '@/lib/i18n/context';
import { FeatureCardApple } from './FeatureCardApple';

export function HeroApple() {
  const { t } = useI18n();

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      {/* Main Heading */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-black/90 mb-6 tracking-tight">
          {t('hero.title1')} {t('hero.title2')} {t('hero.title3')}
        </h1>
        <p className="text-xl md:text-2xl text-black/50 max-w-2xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
        <Link href="/auth/register">
          <Button size="lg">
            {t('hero.getStarted')}
          </Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="secondary" size="lg">
            {t('hero.signIn')}
          </Button>
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <FeatureCardApple
          icon="📸"
          iconColor="bg-blue-50"
          iconTextColor="text-blue-600"
          titleKey="feature.image.title"
          descriptionKey="feature.image.desc"
        />
        <FeatureCardApple
          icon="🔍"
          iconColor="bg-purple-50"
          iconTextColor="text-purple-600"
          titleKey="feature.analysis.title"
          descriptionKey="feature.analysis.desc"
        />
        <FeatureCardApple
          icon="🔒"
          iconColor="bg-green-50"
          iconTextColor="text-green-600"
          titleKey="feature.storage.title"
          descriptionKey="feature.storage.desc"
        />
      </div>
    </section>
  );
}
```

### FeatureCardApple (components/ui/FeatureCardApple.tsx)

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface FeatureCardAppleProps {
  icon: string;
  iconColor: string;
  iconTextColor: string;
  titleKey: string;
  descriptionKey: string;
  className?: string;
}

export function FeatureCardApple({ 
  icon, 
  iconColor,
  iconTextColor,
  titleKey, 
  descriptionKey,
  className 
}: FeatureCardAppleProps) {
  const { t } = useI18n();

  return (
    <div 
      className={cn(
        'bg-white rounded-3xl p-8 border border-black/5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out',
        className
      )}
    >
      <div className="flex flex-col">
        {/* Icon */}
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mb-6', iconColor)}>
          <span className={cn('text-2xl', iconTextColor)}>{icon}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-black/90 mb-3 tracking-tight">
          {t(titleKey)}
        </h3>
        
        {/* Description */}
        <p className="text-base text-black/50 leading-relaxed">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
}
```

### DashboardMetricCardApple (components/ui/DashboardMetricCardApple.tsx)

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardMetricCardAppleProps {
  icon: string;
  value: number;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-100'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100'
  }
};

export function DashboardMetricCardApple({ 
  icon, 
  value, 
  label,
  color,
  className 
}: DashboardMetricCardAppleProps) {
  const styles = colorStyles[color];

  return (
    <div 
      className={cn(
        'bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.bg)}>
          <span className={cn('text-xl', styles.text)}>{icon}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="text-3xl font-semibold text-black/90 mb-1 tracking-tight">
            {value}
          </div>
          <div className="text-sm text-black/50 font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### AuthFormApple (components/ui/AuthFormApple.tsx)

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuthFormAppleProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthFormApple({ 
  children, 
  title, 
  subtitle,
  className 
}: AuthFormAppleProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12">
      <div 
        className={cn(
          'bg-white rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/5 w-full max-w-md p-8 md:p-10',
          className
        )}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black/90 mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-black/50">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
}
```

### PageContainer (components/ui/PageContainer.tsx)

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('min-h-screen bg-[#FAFAFA]', className)}>
      {children}
    </div>
  );
}
```

### TableApple (components/ui/TableApple.tsx)

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableAppleProps {
  children: React.ReactNode;
  className?: string;
}

export function TableApple({ children, className }: TableAppleProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-2xl border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### LanguageSelector (components/LanguageSelector.tsx)

```tsx
'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
      <button
        onClick={() => setLanguage('tr')}
        className={cn(
          'px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200',
          language === 'tr'
            ? 'bg-white text-black/90 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
            : 'text-black/50 hover:text-black/70'
        )}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200',
          language === 'en'
            ? 'bg-white text-black/90 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
            : 'text-black/50 hover:text-black/70'
        )}
      >
        EN
      </button>
    </div>
  );
}
```

### ImportantNoticeCard (components/ui/ImportantNoticeCard.tsx)

```tsx
'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

export function ImportantNoticeCard() {
  const { t } = useI18n();

  return (
    <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100/80 rounded-xl flex items-center justify-center">
          <span className="text-lg">⚠️</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black/90 mb-2 tracking-tight">{t('notice.title')}</h3>
          <p 
            className="text-sm text-black/60 leading-relaxed mb-3"
            dangerouslySetInnerHTML={{ __html: t('notice.text') }}
          />
          <Link 
            href="/hakkimizda" 
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('notice.learnMore')}
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 📄 3. Sayfalar

### Homepage (app/page.tsx)

```tsx
'use client';

import { HeroApple } from '@/components/ui/HeroApple';
import { ImportantNoticeCard } from '@/components/ui/ImportantNoticeCard';
import { PageContainer } from '@/components/ui/PageContainer';
import { useI18n } from '@/lib/i18n/context';

export default function Home() {
  const { t } = useI18n();

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroApple />

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
            <div className="text-3xl font-semibold text-blue-600 mb-2 tracking-tight">{t('stats.ai')}</div>
            <div className="text-xs text-black/50 font-medium">{t('stats.aiDesc')}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
            <div className="text-3xl font-semibold text-green-600 mb-2 tracking-tight">{t('stats.secure')}</div>
            <div className="text-xs text-black/50 font-medium">{t('stats.secureDesc')}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
            <div className="text-3xl font-semibold text-purple-600 mb-2 tracking-tight">{t('stats.access')}</div>
            <div className="text-xs text-black/50 font-medium">{t('stats.accessDesc')}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center">
            <div className="text-3xl font-semibold text-yellow-600 mb-2 tracking-tight">{t('stats.kvkk')}</div>
            <div className="text-xs text-black/50 font-medium">{t('stats.kvkkDesc')}</div>
          </div>
        </div>

        {/* Important Notice */}
        <ImportantNoticeCard />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-black/50">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </PageContainer>
  );
}
```

---

## 🎨 Tasarım Özellikleri

### Renkler
- **Background**: `#FAFAFA` (Apple Notes/Settings benzeri)
- **Surface**: `#FFFFFF` (Beyaz kartlar)
- **Border**: `rgba(0, 0, 0, 0.08)` (Hairline border)
- **Shadow**: `0 4px 16px rgba(0, 0, 0, 0.06)` (Yumuşak gölge)
- **Text Primary**: `#1D1D1F` (Siyah)
- **Text Secondary**: `#666666` (Gri)
- **Accent Colors**: Pastel mavi, mor, yeşil, sarı

### Tipografi
- **Font**: Inter, SF Pro Display benzeri
- **Letter Spacing**: `-0.01em` (Sıkı)
- **Font Weight**: 600 (Semibold) başlıklar için
- **Line Height**: 1.1-1.3 (Sıkı)

### Border Radius
- **Kartlar**: `rounded-2xl` (1rem) veya `rounded-3xl` (1.5rem)
- **Butonlar**: `rounded-full` (Tam pill-shaped)
- **Input'lar**: `rounded-lg` (0.5rem)

### Shadows
- **Kartlar**: `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
- **Hover**: `shadow-[0_4px_12px_rgba(0,0,0,0.06)]`
- **Butonlar**: `shadow-[0_2px_8px_rgba(59,130,246,0.25)]`

### Transitions
- **Duration**: 200ms
- **Easing**: `ease-out` veya `cubic-bezier(0.4, 0, 0.2, 1)`

---

## 📝 Notlar

- Tüm component'ler TypeScript ile yazılmıştır
- i18n desteği mevcuttur (`useI18n` hook'u)
- Responsive tasarım (mobile-first)
- Accessibility odaklı (semantic HTML, ARIA labels)
- Apple Health ve Settings uygulamalarından ilham alınmıştır

---

**Son Güncelleme**: Apple-style redesign tamamlandı ✅

