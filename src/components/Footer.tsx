import Image from 'next/image';

export default function Footer() {
  return (
    <footer id="footer" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1920&q=85"
          alt="Global infrastructure"
          fill
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/80 to-obsidian" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ice-blue/10 border border-ice-blue/20 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 64 64"
                  fill="none"
                  className="text-ice-blue"
                >
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M32 12 L32 52 M16 24 L48 24 M16 40 L48 40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                  <circle cx="32" cy="32" r="4" fill="currentColor" fillOpacity="0.3" />
                </svg>
              </div>
              <span className="text-sm font-medium tracking-wider text-pearl/80">
                HYPERION
              </span>
            </div>
            <p className="text-xs text-titanium/50 leading-relaxed max-w-sm">
              Autonomous AI War Room platform. Detecting, analyzing, and
              neutralizing enterprise-scale threats in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-titanium/40">
                Platform
              </span>
              <div className="space-y-2">
                {['War Room', 'Agents', 'Technology', 'Dashboard'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="block text-xs text-titanium/60 hover:text-pearl/80 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-titanium/40">
                Company
              </span>
              <div className="space-y-2">
                {['About', 'Careers', 'Contact', 'Press'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-xs text-titanium/60 hover:text-pearl/80 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-titanium/40 block">
              Stay Informed
            </span>
            <p className="text-xs text-titanium/50 leading-relaxed">
              Receive enterprise threat briefings and platform updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-xs rounded-full bg-pearl/5 border border-pearl/10 text-pearl/60 placeholder:text-titanium/30 focus:outline-none focus:border-ice-blue/30 transition-colors"
              />
              <button className="px-5 py-2.5 text-xs tracking-wider rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all duration-300 uppercase">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-pearl/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-titanium/30">
            &copy; {new Date().getFullYear()} Hyperion. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] text-titanium/30 hover:text-titanium/50 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
