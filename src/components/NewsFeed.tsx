'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLiveNews, NewsItem } from '@/lib/apiService';
import { ExternalLink, Newspaper } from 'lucide-react';

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchLiveNews().then((items) => {
      setNews(items);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (news.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper size={12} className="text-ice-blue/60" />
        <span className="text-[9px] uppercase tracking-widest text-titanium/40 font-mono">Live Intelligence Feed</span>
        {loaded && (
          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-emerald/10 text-emerald/70 ml-auto font-mono tracking-wider">
            LIVE
          </span>
        )}
      </div>
      <div className="relative h-16">
        <AnimatePresence mode="wait">
          {news.length > 0 ? (
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <p className="text-xs text-pearl/70 leading-relaxed line-clamp-2">{news[current].title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[8px] text-titanium/30 font-mono">{news[current].source}</span>
                <span className="w-1 h-1 rounded-full bg-pearl/10" />
                <span className="text-[8px] text-titanium/20 font-mono">
                  {new Date(news[current].publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {news[current].url && news[current].url !== '#' && (
                  <a href={news[current].url} target="_blank" rel="noopener noreferrer" className="text-[8px] text-ice-blue/40 hover:text-ice-blue/70 transition-colors ml-auto flex items-center gap-1">
                    Source <ExternalLink size={7} />
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-4 h-4 border-2 border-ice-blue/20 border-t-ice-blue/60 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            </div>
          )}
        </AnimatePresence>
      </div>
      {news.length > 1 && (
        <div className="flex items-center gap-1.5 mt-2">
          {news.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? 'w-4 bg-ice-blue/60' : 'w-1.5 bg-pearl/10 hover:bg-pearl/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
