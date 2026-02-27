'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

export function ImportantNoticeCard() {
  const { t } = useI18n();

  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Warning SVG Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 mb-1.5 tracking-tight">
            {t('notice.title')}
          </h3>
          <p
            className="text-sm text-slate-600 leading-relaxed mb-3"
            dangerouslySetInnerHTML={{ __html: t('notice.text') }}
          />
          <Link
            href="/hakkimizda"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
          >
            {t('notice.learnMore')}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
