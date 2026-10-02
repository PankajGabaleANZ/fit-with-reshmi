import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "../lib/theme";
import "../styles-design.css";

export default function Navbar() {
  const { toggleMode, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="neo-nav">
        <Link to="/" className="brandmark" style={{ textDecoration: "none" }}>
          <span className="leaf">🌿</span>
          <span>Reshmi Verma</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            to="/"
            className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
              isActive("/") ? "text-[var(--jade)] font-extrabold" : "text-[var(--ink)] hover:text-[var(--jade)]"
            }`}
            style={{ textDecoration: "none" }}
          >
            {isActive("/") && <span className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]" />}
            Home
          </Link>
          <Link
            to="/breathe"
            className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
              isActive("/breathe") ? "text-[var(--jade)] font-extrabold" : "text-[var(--ink)] hover:text-[var(--jade)]"
            }`}
            style={{ textDecoration: "none" }}
          >
            {isActive("/breathe") && <span className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]" />}
            Breathe
          </Link>
          <Link
            to="/nutrition"
            className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 relative ${
              isActive("/nutrition") ? "text-emerald-500 font-extrabold" : "text-[var(--ink)] hover:text-emerald-500"
            }`}
            style={{ textDecoration: "none" }}
          >
            {isActive("/nutrition") ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            ) : (
              <span className="w-1 h-1 rounded-full bg-emerald-400 opacity-60" />
            )}
            Nutrition
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              New
            </span>
          </Link>
          <Link
            to="/login"
            className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
              isActive("/login") ? "text-[var(--jade)] font-extrabold" : "text-[var(--ink)] hover:text-[var(--jade)]"
            }`}
            style={{ textDecoration: "none" }}
          >
            {isActive("/login") && <span className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]" />}
            Client Portal
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className="theme-toggle"
            onClick={toggleMode}
            title="Toggle Light/Dark"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="nav-cta hidden sm:inline-flex" onClick={() => navigate("/booking")}>
            Book a Consult
          </button>
          
          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden p-2 rounded-xl border border-[var(--glass-line)] text-[var(--ink)] hover:bg-[var(--glass)] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[68px] inset-x-0 bg-[var(--bg)]/95 backdrop-blur-xl border-b border-[var(--glass-line)] z-50 p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] hover:text-[var(--jade)] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
          >
            <span>Home</span>
            {isActive("/") && <span className="text-xs text-[var(--jade)]">Active</span>}
          </Link>
          <Link
            to="/breathe"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] hover:text-[var(--jade)] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
          >
            <span>Breathe with Reshmi</span>
            {isActive("/breathe") && <span className="text-xs text-[var(--jade)]">Active</span>}
          </Link>
          <Link
            to="/nutrition"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>Nutrition with Reshmi</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              New
            </span>
          </Link>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] hover:text-[var(--jade)] py-2 border-b border-[var(--glass-line)]"
          >
            Client Portal
          </Link>
          <button
            className="nav-cta w-full py-3 mt-2 text-center justify-center font-bold"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/booking");
            }}
          >
            Book a Consult
          </button>
        </div>
      )}
    </>
  );
}

