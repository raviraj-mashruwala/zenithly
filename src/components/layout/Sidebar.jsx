import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Receipt, Tag, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import './Sidebar.css';

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/wallets', label: 'Wallets', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/categories', label: 'Categories', icon: Tag },
    { path: '/reports/income', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Logo Section */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">M</div>
                    {!isCollapsed && <span className="logo-text">MonoLife</span>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={20} className="nav-icon" />
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <div className="user-name">{user?.user_metadata?.display_name || 'User'}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    )}
                </div>
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
