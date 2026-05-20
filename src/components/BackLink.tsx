'use client';

import { useRouter } from '@/i18n/navigation';

export default function BackLink({ label }: { label: string }) {
  const router = useRouter();

  const handleBack = () => {
    const saved = sessionStorage.getItem('catalogParams');
    router.push(saved ? `/catalog?${saved}` : '/catalog');
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-white/40 hover:text-[#27C4A0] text-sm transition-colors mb-4"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </button>
  );
}
