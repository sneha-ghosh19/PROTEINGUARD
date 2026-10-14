import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { WhyProteinGuard } from '../components/WhyProteinGuard';
import { HowItWorks } from '../components/HowItWorks';
import { ExampleMutationPreview } from '../components/ExampleMutationPreview';
import { OpenSourceSection } from '../components/OpenSourceSection';
import { GemmaSection } from '../components/GemmaSection';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <DisclaimerBanner />
        <WhyProteinGuard />
        <HowItWorks />
        <ExampleMutationPreview />
        <OpenSourceSection />
        <GemmaSection />
      </main>
      <Footer />
    </div>
  );
};
