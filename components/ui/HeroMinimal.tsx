'use client';

import Link from 'next/link';
import { Button } from './Button';
import { useI18n } from '@/lib/i18n/context';
import { FeatureCardFlat } from './FeatureCardFlat';

export function HeroMinimal() {
  const { t } = useI18n();

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      {/* Main Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          {t('hero.title1')} {t('hero.title2')} {t('hero.title3')}
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCardFlat
          icon="📸"
          iconColor="bg-blue-100 text-blue-600"
          titleKey="feature.image.title"
          descriptionKey="feature.image.desc"
        />
        <FeatureCardFlat
          icon="🔍"
          iconColor="bg-purple-100 text-purple-600"
          titleKey="feature.analysis.title"
          descriptionKey="feature.analysis.desc"
        />
        <FeatureCardFlat
          icon="🔒"
          iconColor="bg-green-100 text-green-600"
          titleKey="feature.storage.title"
          descriptionKey="feature.storage.desc"
        />
      </div>
    </section>
  );
}

