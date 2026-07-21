'use client';

import { useState } from 'react';
import SplashScreen from '@/components/SplashScreen';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LiveStatusStrip from '@/components/LiveStatusStrip';
import WarRoom from '@/components/WarRoom';
import DataFeed from '@/components/DataFeed';
import AnomalyDashboard from '@/components/AnomalyDashboard';
import VoiceHUD from '@/components/VoiceHUD';
import FloatingCore from '@/components/FloatingCore';
import Footer from '@/components/Footer';

export default function Home() {
  const [splashComplete, setSplashComplete] = useState(false);

  return (
    <>
      {!splashComplete && <SplashScreen onComplete={() => setSplashComplete(true)} />}

      <div className="relative">
        <Navbar />
        <FloatingCore />
        <Hero />
        <LiveStatusStrip />
        <WarRoom />
        <DataFeed />
        <AnomalyDashboard />
        <Footer />
        <VoiceHUD />
      </div>
    </>
  );
}
