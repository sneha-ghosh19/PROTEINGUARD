import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dna, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${anchorId}`);
      return;
    }
    const element = document.querySelector(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070a12]/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Dna className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-wider text-white flex items-center gap-1.5">
              PROTEIN<span className="text-cyan-400">GUARD</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase -mt-1 font-mono">
              Mutation Analysis
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className="text-slate-200 hover:text-cyan-400 transition-colors py-1"
          >
            Home
          </Link>
          <button
            onClick={() => handleNavClick('#how-it-works')}
            className="text-slate-400 hover:text-cyan-400 transition-colors py-1 cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('#technology')}
            className="text-slate-400 hover:text-cyan-400 transition-colors py-1 cursor-pointer"
          >
            Technology
          </button>
          <button
            onClick={() => handleNavClick('#open-source')}
            className="text-slate-400 hover:text-cyan-400 transition-colors py-1 cursor-pointer"
          >
            Open Source
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate('/mutation-lab')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-semibold text-sm hover:from-cyan-400 hover:to-teal-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:bg-white/5 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0e1a] border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-3 font-medium text-slate-300">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-white/5 hover:text-cyan-400"
            >
              Home
            </Link>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-cyan-400"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#technology')}
              className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-cyan-400"
            >
              Technology
            </button>
            <button
              onClick={() => handleNavClick('#open-source')}
              className="text-left px-3 py-2 rounded-md hover:bg-white/5 hover:text-cyan-400"
            >
              Open Source
            </button>
          </nav>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/mutation-lab');
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-sm font-semibold shadow-md"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
