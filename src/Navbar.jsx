import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UnifiedSearch from "./UnifiedSearch";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideMobileSearch, setHideMobileSearch] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth <= 980;

      if (!isMobile) {
        setHideMobileSearch(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY <= 12) {
        setHideMobileSearch(false);
      } else if (currentScrollY > lastScrollY) {
        setHideMobileSearch(true);
      } else if (currentScrollY < lastScrollY) {
        setHideMobileSearch(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/riders", label: "Riders" },
    { to: "/season", label: "Seasons" },
    { to: "/results", label: "Race Results" },
    { to: "/leaderboards", label: "Leaderboards" },
    { to: "/compare", label: "Comparison Tool" },
  ];

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <div className="nav-logo">
            <Link to="/">
              <img
                src="/smxmuselogo.png"
                alt="SMXmuse"
                className="nav-logo-image"
              />
            </Link>
          </div>

          <div className="nav-links">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <UnifiedSearch />
        </div>

        <div className="nav-mobile-shell">
          <div className="nav-mobile-topbar">
            <div className="nav-mobile-logo">
              <Link to="/">
                <img
                  src="/smxmuselogo.png"
                  alt="SMXmuse"
                  className="nav-logo-image"
                />
              </Link>
            </div>

            <button
              type="button"
              className="nav-mobile-menu-button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle site navigation"
            >
              MENU
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="nav-mobile-dropdown">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-mobile-dropdown-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div
            className={`nav-mobile-search-row${hideMobileSearch && !mobileMenuOpen ? " is-hidden" : ""}`}
          >
            <UnifiedSearch />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
