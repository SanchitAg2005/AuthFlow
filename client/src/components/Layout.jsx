import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Top Header Navbar */}
      <header className="app-navbar">
        <div className="nav-brand">AuthFlow Dashboard</div>

        <div className="nav-actions">
          {/* User Profile Badge */}
          {user && (
            <div className="user-profile">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className={`user-role-badge ${user.role}`}>
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Logout Trigger */}
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content enclosing Page Views */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
