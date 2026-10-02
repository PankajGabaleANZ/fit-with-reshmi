import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import Brand from "./Brand";

const NAV_LINKS: { label: string; to: string; hash?: boolean }[] = [
  { label: "About", to: "/#about", hash: true },
  { label: "Programs", to: "/#how-we-work", hash: true },
  { label: "Assessments", to: "/#assessment", hash: true },
];
const RESOURCES = [
  { label: "Breathe with Reshmi", to: "/breathe" },
  { label: "Nutrition with Reshmi", to: "/nutrition" },
];
const CONTACT = { label: "Contact", to: "/#contact" };

const linkClass =
  "text-[13px] font-medium tracking-wide text-muted hover:text-ink transition-colors no-underline whitespace-nowrap";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setResourcesOpen(false);
  }, [location.pathname]);

  // Close the resources dropdown on outside click / Escape
  useEffect(() => {
    if (!resourcesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!resourcesRef.current?.contains(e.target as Node)) setResourcesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setResourcesOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [resourcesOpen]);

  const resourceActive = RESOURCES.some((r) => r.to === location.pathname);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-[72px] bg-canvas/95 backdrop-blur border-b border-line">
        <div className="h-full max-w-[1280px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-6">
          <Link to="/" className="flex flex-col leading-none no-underline whitespace-nowrap shrink-0" aria-label="HealthwithReshmi, home">
            <Brand className="font-serif text-[21px] sm:text-[23px] tracking-tight text-ink" />
            <span className="mt-1.5 text-[10px] tracking-[0.22em] uppercase text-faint">Science-led. Human-centred.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.to} className={linkClass}>
                {l.label}
              </a>
            ))}

            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen((o) => !o)}
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
                className={`${linkClass} inline-flex items-center gap-1 cursor-pointer ${resourceActive ? "!text-ink" : ""}`}
              >
                Resources <ChevronDown size={14} className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 min-w-[220px] bg-canvas border border-line rounded-lg shadow-lg py-2">
                  {RESOURCES.map((r) => (
                    <Link
                      key={r.to}
                      to={r.to}
                      className="block px-4 py-2.5 text-[13px] text-muted hover:text-ink hover:bg-surface no-underline"
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a href={CONTACT.to} className={linkClass}>
              {CONTACT.label}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/booking")}
              className="hidden sm:inline-flex items-center whitespace-nowrap px-5 py-2.5 rounded-md bg-espresso text-linen text-[12px] font-semibold tracking-[0.1em] uppercase hover:opacity-90 transition-opacity cursor-pointer"
            >
              Book a Consultation →
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
        <div className="lg:hidden fixed top-[72px] inset-x-0 z-40 bg-canvas border-b border-line px-5 py-4 shadow-lg flex flex-col max-h-[calc(100vh-72px)] overflow-y-auto">
          {[...NAV_LINKS, CONTACT].map((l) => (
            <a
              key={l.label}
              href={l.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`${linkClass} !text-[15px] py-3.5 border-b border-line`}
            >
              {l.label}
            </a>
          ))}
          {RESOURCES.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`${linkClass} !text-[15px] py-3.5 border-b border-line`}
            >
              {r.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/booking");
            }}
            className="mt-4 w-full py-3.5 rounded-md bg-espresso text-linen text-[12px] font-semibold tracking-[0.1em] uppercase cursor-pointer"
          >
            Book a Consultation →
          </button>
        </div>
      )}
    </>
  );
}
