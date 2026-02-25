import { NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { LogoutButton } from './LogoutButton';

export function NavBar() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <nav className="nav">
      <div className="nav-brand">🐛 Bug Reporter</div>
      <ul className="nav-links">
        {!isAuthenticated && (
          <li>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
              Login
            </NavLink>
          </li>
        )}
        {isAuthenticated && (
          <li>
            <NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>
              Report Bug
            </NavLink>
          </li>
        )}
        {isAdmin && (
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              Admin Reports
            </NavLink>
          </li>
        )}
        {isAuthenticated && user && (
          <li>
            <LogoutButton email={user.email} onLogout={logout} />
          </li>
        )}
      </ul>
    </nav>
  );
}
