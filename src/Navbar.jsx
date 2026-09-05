import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UnifiedSearch from "./UnifiedSearch";
import AffiliateAd from "./AffiliateAd";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/riders", label: "Riders" },
    { to: "/season", label: "Seasons" },
    { to: "/results", label: "Race Results" },
    { to: "/news", label: "News" },
    { to: "/leaderboards", label: "Leaderboards" },
    { to: "/compare", label: "Comparison Tool" },
    { to: "/about", label: "About" },
  ];

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <div className="nav-logo">
            <Link to="/">
              <img
                src="/OneLineTransparent-cropped.png"
                alt="smxmuse"
                className="nav-logo-image"
              />
            </Link>
          </div>

          <div className="nav-links">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <span>{item.label}</span>
                {item.badge && <span className="nav-new-badge">{item.badge}</span>}
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
                  src="/OneLineTransparent-cropped.png"
                  alt="smxmuse"
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
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-new-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          )}

          <div className="nav-mobile-search-row">
            <UnifiedSearch />
          </div>
        </div>

        <AffiliateAd />
      </div>
    </div>
  );
}

export default Navbar;
