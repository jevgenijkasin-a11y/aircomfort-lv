import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const { data } = await supabaseAdmin
    .from('employees_cards')
    .select('name, position')
    .eq('token', token)
    .eq('is_active', true)
    .single();
  if (!data) return { title: 'AirComfort' };
  return {
    title: `${data.name} — AirComfort`,
    description: `${data.position} · AirComfort`,
    robots: { index: false },
  };
}

export default async function CardPage({ params }: Props) {
  const { token } = await params;

  const { data } = await supabaseAdmin
    .from('employees_cards')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (!data) notFound();

  const vcardUrl = `/card/${token}/vcard`;

  const initials = data.name
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0B1929] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#0D2137] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          <div className="h-24 bg-gradient-to-br from-[#27C4A0] to-[#1A6B9A]" />

          <div className="flex justify-center -mt-12 px-6">
            {data.photo_url ? (
              <img
                src={data.photo_url}
                alt={data.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#0D2137] shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#27C4A0] to-[#1A6B9A] border-4 border-[#0D2137] flex items-center justify-center shadow-xl">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}
          </div>

          <div className="text-center px-6 pt-4 pb-2">
            <h1 className="text-xl font-bold text-white">{data.name}</h1>
            <p className="text-[#27C4A0] text-sm font-medium mt-0.5">{data.position}</p>
            <p className="text-white/40 text-xs mt-1">AirComfort</p>
          </div>

          <div className="mx-6 my-4 border-t border-white/8" />

          <div className="px-6 pb-6 space-y-3">
            <a
              href={`tel:${data.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 w-full bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] font-semibold py-3.5 px-4 rounded-2xl transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.074.822-1.97 1.895-2.054C5.19 4.207 6.3 4.125 7.5 4.125c.69 0 1.313.405 1.604 1.031l.686 1.524A1.875 1.875 0 019.183 8.5l-.688.687A16.5 16.5 0 0015 14.75l.687-.688a1.875 1.875 0 011.819-.607l1.524.686A1.875 1.875 0 0119.875 16.5c0 1.2-.082 2.31-.16 3.355-.084 1.073-.98 1.895-2.054 1.895-8.284 0-15-6.716-15-15z" />
              </svg>
              <span>{data.phone}</span>
            </a>

            <a
              href={`mailto:${data.email}`}
              className="flex items-center gap-3 w-full bg-white/8 hover:bg-white/14 text-white font-medium py-3.5 px-4 rounded-2xl transition-colors border border-white/10"
            >
              <svg className="w-5 h-5 flex-shrink-0 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span>{data.email}</span>
            </a>

            <a
              href={vcardUrl}
              download={`${data.slug}.vcf`}
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium py-3 px-4 rounded-2xl transition-colors border border-white/8"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.25 5.25 0 011.226 9.095M6.75 19.5h10.5" />
              </svg>
              Saglabāt kontaktu / Сохранить контакт
            </a>
          </div>

          <div className="border-t border-white/8 px-6 py-3 flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#27C4A0] to-[#1A6B9A] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M12 3v18M3 12h18" />
                <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="text-white/40 text-xs">aircomfort.lv</span>
          </div>
        </div>
      </div>
    </div>
  );
}
