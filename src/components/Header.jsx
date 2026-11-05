
import { Bell, Menu, Search } from "lucide-react";

function Header({ title, isMobileMenuOpen, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="header-left">
        <button
          className="mobile-menu"
          type="button"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="breadcrumb">Workspace / {title}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="header-actions">
        <button className="header-icon">
          <Search size={19} />
        </button>

        <button className="header-icon">
          <Bell size={19} />
        </button>

        <div className="header-avatar">D</div>
      </div>
    </header>
  );
}

export default Header;
