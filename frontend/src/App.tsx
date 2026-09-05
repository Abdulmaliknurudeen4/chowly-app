// App.tsx - Updated SVG import
import { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import WaiterView from './components/WaiterView';
import ManagerView from './components/ManagerView';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Users, ClipboardList, LayoutDashboard, Crown } from 'lucide-react';
import logo from '../assets/logo.svg';
import './App.css';

type Role = 'CUSTOMER' | 'WAITER' | 'MANAGER';

function App() {
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { id: 'CUSTOMER', label: 'Dine In', icon: Users },
    { id: 'WAITER', label: 'Service', icon: ClipboardList },
    { id: 'MANAGER', label: 'Analytics', icon: LayoutDashboard },
  ];

  const getRoleIcon = () => {
    switch(role) {
      case 'CUSTOMER': return <Users className="w-5 h-5" />;
      case 'WAITER': return <ClipboardList className="w-5 h-5" />;
      case 'MANAGER': return <LayoutDashboard className="w-5 h-5" />;
    }
  };

  const getRoleLabel = () => {
    switch(role) {
      case 'CUSTOMER': return 'Customer View';
      case 'WAITER': return 'Waiter Dashboard';
      case 'MANAGER': return 'Manager Analytics';
    }
  };

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {isSplashVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="splash-screen"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 1.2 },
                scale: { duration: 1.4 }
              }}
              className="splash-content"
            >
              <img src={logo} alt="Brand Logo" className="splash-logo" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="splash-tagline"
              >
                Premium Dining Experience
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App */}
      <div className="app-container">
        {/* Navigation */}
        <nav className="app-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <img src={logo} alt="Brand Logo" className="nav-logo" />
              <span className="nav-brand-text">Chowly</span>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-desktop">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = role === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRole(item.id as Role);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="nav-indicator"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Badge */}
            <div className="nav-role-badge">
              <Crown className="w-4 h-4 text-terracotta" />
              <span className="text-sm font-medium text-dark-green">
                {getRoleLabel()}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="nav-mobile"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = role === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setRole(item.id as Role);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`nav-mobile-btn ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {isActive && <span className="nav-mobile-active-dot" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Main Content */}
        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="view-container"
            >
              {role === 'CUSTOMER' && <CustomerView />}
              {role === 'WAITER' && <WaiterView />}
              {role === 'MANAGER' && <ManagerView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

export default App;