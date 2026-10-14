import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, ShieldAlert } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { useConfig } from '../hooks/useConfig';

export const Footer: React.FC = () => {
  const { config } = useConfig();

  return (
    <footer className="bg-[#05070d] border-t border-white/10 text-slate-400 text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Dna className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-wider text-white">
                PROTEIN<span className="text-cyan-400">GUARD</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Explainable amino-acid mutation analysis platform combining biochemical properties, conservation metrics, structural context, and Gemma 4 reasoning.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/mutation-lab" className="hover:text-cyan-400 transition-colors">Mutation Lab</Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#technology" className="hover:text-cyan-400 transition-colors">Technology Architecture</a>
              </li>
            </ul>
          </div>

          {/* Open Source & Docs Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200">
              Open Source
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={config.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href={`${config.github_url}#readme`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href={`${config.github_url}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Contributing Guidelines
                </a>
              </li>
              <li>
                <a
                  href={`${config.github_url}/blob/main/LICENSE`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Apache 2.0 / MIT License
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © 2026 ProteinGuard. Open Source Software.
          </div>
          
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Research and educational use. Not a clinical diagnostic system.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
