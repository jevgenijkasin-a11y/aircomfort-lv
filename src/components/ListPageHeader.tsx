// Page heading band used by the favourites and comparison pages (same look
// as the catalog header).
export default function ListPageHeader({ title }: { title: string }) {
  return (
    <div className="pt-32 md:pt-36 pb-6 md:pb-8 bg-gradient-to-b from-surface to-page relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--text)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h1 className="font-heading font-bold text-3xl sm:text-5xl">{title}</h1>
      </div>
    </div>
  );
}
