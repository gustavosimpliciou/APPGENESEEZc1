import { Link } from "wouter";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-6 pointer-events-none">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <Link href="/" className="pointer-events-auto group">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wider text-white uppercase leading-none">
                Geneseez
              </span>
              <span className="font-body text-[10px] tracking-[0.2em] text-white/50 uppercase leading-none mt-1 group-hover:text-white/80 transition-colors">
                Motion Studio
              </span>
            </div>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 pointer-events-auto">
          <div className="h-px w-16 bg-white/10" />
          <span className="text-xs font-mono text-white/30">V 1.0.0-BETA</span>
        </nav>
      </div>
    </header>
  );
}
