'use client';

import { statusStripItems } from '@/constants/mockData';

export default function LiveStatusStrip() {
  return (
    <section className="relative border-y border-pearl/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-graphite/50 to-obsidian" />
      <div className="relative py-4">
        <div className="flex animate-scroll gap-12 whitespace-nowrap">
          {[...statusStripItems, ...statusStripItems].map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center gap-3 flex-shrink-0"
            >
              <span className="text-xs tracking-wider text-titanium uppercase">
                {item.label}
              </span>
              <span className="text-sm font-mono text-pearl">
                {item.value}
                <span className="text-[10px] text-titanium ml-0.5">{item.unit}</span>
              </span>
              <span
                className={`text-[10px] ${
                  item.trend === 'up'
                    ? 'text-crimson'
                    : item.trend === 'down'
                    ? 'text-emerald'
                    : 'text-titanium'
                }`}
              >
                {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '◆'}
              </span>
              <span className="w-1 h-1 rounded-full bg-pearl/10" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </section>
  );
}
