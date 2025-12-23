
export default function Badge({ badgeKey, name }: { badgeKey: string; name: string }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-black/40 border border-white/5 p-3 hover:border-primary/30 transition-all hover:scale-[1.02] hover:bg-black/60 shadow-lg">
      <div className="h-12 w-12 rounded-lg overflow-hidden bg-black/30 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
        <img
          src={`/badges/${badgeKey}.png`}
          alt={name}
          className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(46,230,166,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(46,230,166,0.5)] transition-all"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/badges/default.png';
          }}
        />
      </div>
      <div className="text-sm">
        <div className="font-bold text-white/90 group-hover:text-primary transition-colors">{name}</div>
        <div className="text-white/40 text-[10px] uppercase tracking-wider font-mono">{badgeKey}</div>
      </div>
    </div>
  );
}
