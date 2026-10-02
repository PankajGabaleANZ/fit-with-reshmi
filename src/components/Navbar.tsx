import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
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
      {/* Top Banner per Specification Sheet */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#2A1B14] text-[#FAF8F5] py-1.5 px-4 text-center text-[10px] sm:text-[11px] font-sans tracking-widest uppercase flex items-center justify-center gap-2 border-b border-black/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D48464] animate-pulse"></span>
        <span>Functional Wellness Website: <strong className="text-white">reshmiverma.com</strong></span>
        <span className="hidden md:inline text-white/40">•</span>
        <span className="hidden md:inline text-white/80">Integrative Nutrition & Somatic Breathwork</span>
      </div>

      <nav className="neo-nav !top-[29px]">
        {/* Brand Header (Sans-Serif) */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group" style={{ textDecoration: "none" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#D48464] group-hover:scale-125 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="font-sans font-extrabold text-sm sm:text-base tracking-[0.16em] uppercase text-[#2A1B14] dark:text-[#FAF8F5]">
              RESHMI VERMA
            </span>
            <span className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#564238] dark:text-[#E6D7CD] font-medium -mt-0.5">
              Functional Wellness
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            to="/"
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              isActive("/") ? "text-[#D48464] font-extrabold" : "text-[#2A1B14] dark:text-[#FAF8F5] hover:text-[#D48464]"
            }`}
            style={{ textDecoration: "none" }}
          >
            Home
          </Link>
          <a
            href="/#audit-hub"
            className="text-xs font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] hover:text-[#D48464] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Audit Hub
          </a>
          <Link
            to="/breathe"
            className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              isActive("/breathe") ? "text-[#D48464] font-extrabold" : "text-[#2A1B14] dark:text-[#FAF8F5] hover:text-[#D48464]"
            }`}
            style={{ textDecoration: "none" }}
          >
            Breathe
            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-[#D48464]/15 text-[#D48464] font-bold">4-7-8</span>
          </Link>
          <Link
            to="/nutrition"
            className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              isActive("/nutrition") ? "text-[#4D735D] font-extrabold" : "text-[#2A1B14] dark:text-[#FAF8F5] hover:text-[#4D735D]"
            }`}
            style={{ textDecoration: "none" }}
          >
            Nutrition
            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-[#4D735D]/15 text-[#4D735D] font-bold">Bio</span>
          </Link>
          <a
            href="/#method"
            className="text-xs font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] hover:text-[#D48464] transition-colors"
            style={{ textDecoration: "none" }}
          >
            Method
          </a>
          <a
            href="/#ai-lab"
            className="text-xs font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] hover:text-[#D48464] transition-colors"
            style={{ textDecoration: "none" }}
          >
            AI Lab
          </a>
          <Link
            to="/login"
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              isActive("/login") ? "text-[#D48464] font-extrabold" : "text-[#564238] dark:text-[#E6D7CD] hover:text-[#D48464]"
            }`}
            style={{ textDecoration: "none" }}
          >
            Client Portal
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="theme-toggle"
            onClick={toggleMode}
            title="Toggle Light/Dark"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          
          {/* Header Button (Espresso) per Snapshot */}
          <button
            className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#FAF8F5] bg-[#2A1B14] dark:bg-[#FAF8F5] dark:text-[#2A1B14] hover:bg-[#3E291F] dark:hover:bg-white shadow-md transition-all hover:scale-105 cursor-pointer border border-black/10"
            onClick={() => navigate("/booking")}
          >
            Book Consultation
          </button>
          
          {/* Mobile Menu Toggle Button */}
          <button
            className="lg:hidden p-2 rounded-xl border border-[var(--glass-line)] text-[var(--ink)] hover:bg-[var(--glass)] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[86px] inset-x-0 bg-[#FAF8F5] dark:bg-[#1A110D] border-b border-[var(--glass-line)] z-50 p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
            style={{ textDecoration: "none" }}
          >
            <span>Home</span>
            {isActive("/") && <span className="text-xs text-[#D48464]">Active</span>}
          </Link>
          <a
            href="/#audit-hub"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
            style={{ textDecoration: "none" }}
          >
            <span>Diagnostic Audit Hub</span>
            <span className="text-[10px] text-[#D48464] font-mono">Page 1</span>
          </a>
          <Link
            to="/breathe"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
            style={{ textDecoration: "none" }}
          >
            <span>Breathe with Reshmi</span>
            <span className="text-[10px] text-[#D48464] font-mono">4-7-8 Pacer</span>
          </Link>
          <Link
            to="/nutrition"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
            style={{ textDecoration: "none" }}
          >
            <span>Nutrition with Reshmi</span>
            <span className="text-[10px] text-[#4D735D] font-mono">Bio-Alchemy</span>
          </Link>
          <a
            href="/#method"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
            style={{ textDecoration: "none" }}
          >
            <span>RESET Method</span>
          </a>
          <a
            href="/#ai-lab"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)] flex items-center justify-between"
            style={{ textDecoration: "none" }}
          >
            <span>AI Lab Companion</span>
          </a>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold uppercase tracking-wider text-[#2A1B14] dark:text-[#FAF8F5] py-2 border-b border-[var(--glass-line)]"
            style={{ textDecoration: "none" }}
          >
            Client Portal
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/booking");
            }}
            className="w-full mt-2 py-3 rounded-full bg-[#2A1B14] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest shadow-md text-center"
          >
            Book Consultation
          </button>
        </div>
      )}
    </>
  );
}
