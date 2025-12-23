export default function Panel({ title, children, className = '' }: { title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-panel border border-white/5 shadow-glow ${className}`}>
      {title ? (
        <div className="px-6 pt-6 pb-3 border-b border-white/5">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      ) : null}
      <div className="p-6">{children}</div>
    </section>
  );
}
