import { Link } from "react-router-dom";
import UnifiedSearch from "./UnifiedSearch";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-inner">

        {/* LEFT SIDE (logo + links stay together) */}
        <div className="nav-left">
          <div className="nav-logo">
            smxmuse
          </div>

          <div className="nav-links">
            <Link to="/countries">Riders</Link>
            <Link to="/season">Seasons</Link>
            <Link to="/results">Race Results</Link>
            <Link to="/">Leaderboards</Link>
            <Link to="/compare">Comparison Tool</Link>
          </div>
        </div>

        {/* RIGHT SIDE (search pushed all the way right) */}
        <div className="nav-right">
          <UnifiedSearch />
        </div>

      </div>
    </div>
  );
}

export default Navbar;