import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminLayout({ currentUser, onSwitchUser, students }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="container" style={{ padding: '2rem 0', display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
            {/* Sidebar */}
            <aside className="card" style={{ padding: '0', overflow: 'hidden', position: 'sticky', top: '2rem' }}>
                <div style={{ padding: 'var(--spacing-lg) var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Admin Panel</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Teacher View</p>
                </div>

                <nav style={{ padding: 'var(--spacing-md)' }}>
                    <ul style={{ listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                        <li>
                            <Link
                                to="/students"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isActive('/students') ? 'var(--bg-secondary)' : 'transparent',
                                    color: isActive('/students') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/students') ? '600' : '400',
                                    textDecoration: 'none'
                                }}
                            >
                                👨‍🎓 Students
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/assignments"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isActive('/assignments') ? 'var(--bg-secondary)' : 'transparent',
                                    color: isActive('/assignments') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/assignments') ? '600' : '400',
                                    textDecoration: 'none'
                                }}
                            >
                                📚 Assignments
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/grammar"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isActive('/grammar') ? 'var(--bg-secondary)' : 'transparent',
                                    color: isActive('/grammar') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/grammar') ? '600' : '400',
                                    textDecoration: 'none'
                                }}
                            >
                                📖 Grammar
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/reviews"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isActive('/reviews') ? 'var(--bg-secondary)' : 'transparent',
                                    color: isActive('/reviews') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/reviews') ? '600' : '400',
                                    textDecoration: 'none'
                                }}
                            >
                                📝 Reviews
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/users"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isActive('/users') ? 'var(--bg-secondary)' : 'transparent',
                                    color: isActive('/users') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/users') ? '600' : '400',
                                    textDecoration: 'none'
                                }}
                            >
                                👥 Users
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* User Switcher in Sidebar (optional placement) 

                <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Switch Context</label>
                    <select
                        value={currentUser}
                        onChange={(e) => onSwitchUser(e.target.value)}
                        style={{ width: '100%', fontSize: '0.875rem' }}
                    >
                        <option value="teacher">👨‍🏫 Teacher (Admin)</option>
                        {students.length > 0 && <optgroup label="Students">
                            {students.map(s => (
                                <option key={s.id} value={s.id}>📝 {s.name}</option>
                            ))}
                        </optgroup>}
                    </select>
                </div>
                */}

                {/* Logout Button */}
                <LogoutButton />
            </aside>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>
        </div>
    );
}

function LogoutButton() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
            <button
                onClick={handleLogout}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                }}
            >
                🚪 Sign Out {user?.username && `(${user.username})`}
            </button>
        </div>
    );
}
