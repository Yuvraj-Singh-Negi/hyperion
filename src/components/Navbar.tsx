'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Platform', href: '#war-room' },
  { label: 'Agents', href: '#agents' },
  { label: 'Technology', href: '#dashboard' },
  { label: 'Dashboard', href: '#data-feed' },
  { label: 'Contact', href: '#footer' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastScroll && current > 100);
      setLastScroll(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
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
                <path
                  d="M32 12 L32 52 M16 24 L48 24 M16 40 L48 40"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                <circle cx="32" cy="32" r="4" fill="currentColor" fillOpacity="0.3" />
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wider text-pearl/80">
              HYPERION
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs tracking-wider text-titanium hover:text-pearl transition-colors duration-300 uppercase"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#hero"
              className="px-5 py-2 text-xs tracking-wider uppercase rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all duration-300"
            >
              Launch War Room
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-pearl/60 hover:text-pearl transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="glass rounded-2xl mt-2 p-4 md:hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-titanium hover:text-pearl transition-colors px-2 py-1.5"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#hero"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-center px-4 py-2 rounded-full bg-ice-blue/10 text-ice-blue border border-ice-blue/20 hover:bg-ice-blue/20 transition-all mt-2"
                >
                  Launch War Room
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
