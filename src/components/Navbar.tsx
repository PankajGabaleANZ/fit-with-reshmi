import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS: { label: string; to: string; hash?: boolean }[] = [
  { label: "Assessments", to: "/#audit-hub", hash: true },
  { label: "Breathe", to: "/breathe" },
  { label: "Nutrition", to: "/nutrition" },
  { label: "Method", to: "/#method", hash: true },
  { label: "AI Lab", to: "/#ai-lab", hash: true },
  { label: "Client Portal", to: "/login" },
];

const linkClass =
  "text-[13px] font-medium tracking-wide text-muted hover:text-ink transition-colors no-underline whitespace-nowrap";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (to: string) => !to.includes("#") && location.pathname === to;

  const renderLink = (l: (typeof NAV_LINKS)[number], onClick?: () => void, extra = "") =>
    l.hash ? (
      <a key={l.label} href={l.to} onClick={onClick} className={`${linkClass} ${extra}`}>
        {l.label}
      </a>
    ) : (
      <Link
        key={l.label}
        to={l.to}
        onClick={onClick}
        className={`${linkClass} ${isActive(l.to) ? "!text-ink" : ""} ${extra}`}
      >
        {l.label}
      </Link>
    );

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-[72px] bg-canvas/95 backdrop-blur border-b border-line">
        <div className="h-full max-w-[1280px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-6">
          <Link to="/" className="flex flex-col leading-none no-underline whitespace-nowrap shrink-0" aria-label="Reshmi Verma, home">
            <span className="font-serif text-[19px] sm:text-[21px] tracking-[0.14em] uppercase text-ink">
              Reshmi Verma
            </span>
            <span className="mt-1.5 text-[10px] tracking-[0.22em] uppercase text-faint">
              Functional Wellness
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main">
            {NAV_LINKS.map((l) => renderLink(l))}
          </nav>

          <div className="flex items-center gap-3">


            <button
              onClick={() => navigate("/booking")}
              className="hidden sm:inline-flex items-center whitespace-nowrap px-5 py-2.5 rounded-md bg-espresso text-linen dark:bg-linen dark:text-espresso text-[12px] font-semibold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity cursor-pointer"
            >
              Book Consultation
            </button>

            <button
              className="lg:hidden p-2 rounded-md text-ink hover:bg-surface transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[72px] inset-x-0 z-40 bg-canvas border-b border-line px-5 py-4 shadow-lg flex flex-col">
          {NAV_LINKS.map((l) =>
            renderLink(l, () => setMobileMenuOpen(false), "!text-[15px] py-3.5 border-b border-line")
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/booking");
            }}
            className="mt-4 w-full py-3.5 rounded-md bg-espresso text-linen dark:bg-linen dark:text-espresso text-[12px] font-semibold tracking-[0.1em] uppercase cursor-pointer"
          >
            Book Consultation
          </button>
        </div>
      )}
    </>
  );
}
