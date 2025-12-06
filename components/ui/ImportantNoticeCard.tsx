'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

export function ImportantNoticeCard() {
  const { t } = useI18n();

  return (
    <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-2xl p-6 shadow-sm">
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
