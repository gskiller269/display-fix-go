import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  initialRepairs, initialTechnicians, initialTickets, initialAddresses 
} from './data';
import { RepairOrder, Technician, SupportTicket, AddressItem } from './types';

// Importing Custom Views
import ClientHome from './components/ClientHome';
import ClientBookingWizard from './components/ClientBookingWizard';
import RepairsHub from './components/RepairsHub';
import ClientSupport from './components/ClientSupport';
import ClientAccount from './components/ClientAccount';
import AdminDashboard from './components/AdminDashboard';
import AdminStaff from './components/AdminStaff';
import AdminMart from './components/AdminMart';
import AdminTechMap from './components/AdminTechMap';
import AdminSupportQueue from './components/AdminSupportQueue';
import AdminRepairs from './components/AdminRepairs';
import AdminAccount from './components/AdminAccount';
import ClientRepairs from './components/ClientRepairs';
import ClientRepairDetails from './components/ClientRepairDetails';
import AuthPage from './components/AuthPage';
import SplashScreen from './components/SplashScreen';
import ClientProfile from './components/ClientProfile';
import ClientAddresses from './components/ClientAddresses';
import ClientNotifications from './components/ClientNotifications';
import ClientAlertPage from './components/ClientAlertPage';
import TechnicianHome from './components/TechnicianHome';
import AdminAddTechnician from './components/AdminAddTechnician';
import AdminBanners from './components/AdminBanners';
import AdminPricing from './components/AdminPricing';
import AdminReviews from './components/AdminReviews';
import TechnicianRepairDetails from './components/TechnicianRepairDetails';

// Main Layout Components
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import TechnicianLayout from './layouts/TechnicianLayout';
import { API_URL, BASE_URL } from './api/api';

export default function App() {
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = React.useState<any | null>(null);
  const [authChecking, setAuthChecking] = React.useState<boolean>(!!localStorage.getItem('token'));
  const [showSplash, setShowSplash] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const [repairs, setRepairs] = React.useState<any[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>(initialTechnicians);
  const [tickets, setTickets] = React.useState<SupportTicket[]>(initialTickets);
  const [addresses, setAddresses] = React.useState<AddressItem[]>(initialAddresses);
  const [selectedAdminRepair, setSelectedAdminRepair] = React.useState<RepairOrder | null>(null);

  const fetchAdminRepairs = React.useCallback(() => {
    if (token && user?.role === 'admin') {
      fetch(`${API_URL}/repairs/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRepairs(data.data || []);
        }
      })
      .catch(err => console.error('Error fetching admin repairs:', err));
    }
  }, [token, user?.role]);

  React.useEffect(() => {
    if (token === 'mock_token_123') {
      // Mock bypass for profile
      setAuthChecking(true);
      setTimeout(() => {
        const storedUser = localStorage.getItem('mock_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ id: 1, role: 'customer', full_name: 'Customer Mock', mobile_number: '9876543210' });
        }
        setAuthChecking(false);
      }, 500);
      return;
    }

    if (token) {
      setAuthChecking(true);
      fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setUser(res.data);
        } else {
          handleSignOut();
        }
      })
      .catch(() => {
        handleSignOut();
      })
      .finally(() => {
        setAuthChecking(false);
      });
    } else {
      setUser(null);
      setAuthChecking(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchAdminRepairs();
    const interval = setInterval(fetchAdminRepairs, 4000);
    return () => clearInterval(interval);
  }, [fetchAdminRepairs]);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleUpdateStatus = (orderId: string, nextStatus: RepairOrder['status'], journeyDetails: string) => {
    // update status logic
  };

  if (showSplash || authChecking) {
    return <SplashScreen />;
  }

  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <Navigate to={
          user.role === 'admin' ? '/admin/dashboard' : 
          user.role === 'technician' ? '/technician/home' : 
          '/customer/home'
        } replace />
      } />
      
      {/* Customer Routes */}
      <Route path="/customer" element={
        user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : 
        user.role === 'technician' ? <Navigate to="/technician/home" replace /> : 
        <CustomerLayout user={user} />
      }>
        <Route path="home" element={<ClientHome />} />
        <Route path="book" element={<RepairsHub />} />
        <Route path="book/wizard/*" element={
          <ClientBookingWizard
            token={token}
            addresses={addresses}
            onAddAddress={() => {}}
            onConfirmBooking={() => {}}
            onCancel={() => {}}
          />
        } />
        <Route path="support" element={<ClientSupport />} />
        <Route path="repairs" element={<ClientRepairs token={token} />} />
        <Route path="repairs/:repairId" element={<ClientRepairDetails token={token} />} />
        <Route path="account" element={
          <ClientAccount 
            token={token}
            user={user}
            onSignOut={handleSignOut} 
          />
        } />
        <Route path="profile" element={<ClientProfile user={user} token={token} onUserUpdate={(updatedUser) => setUser(updatedUser)} />} />
        <Route path="addresses" element={<ClientAddresses token={token} />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="alert" element={<ClientAlertPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        user.role === 'admin' ? <AdminLayout user={user} /> : 
        user.role === 'technician' ? <Navigate to="/technician/home" replace /> : 
        <Navigate to="/customer/home" replace />
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <AdminDashboard 
            repairs={repairs} 
            activeRepairsCount={repairs.filter(r => ['technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done'].includes(r.status)).length} 
            pendingCount={repairs.filter(r => r.status === 'pending').length} 
            revenueTotal={repairs.filter(r => ['repaired', 'payment_done', 'completed'].includes(r.status)).reduce((acc, r) => acc + parseFloat(r.repair_price || r.price || 0), 0)} 
            onNavigateToTab={() => {}} 
            onSelectRepair={() => {}} 
          />
        } />
        <Route path="repairs" element={<AdminRepairs token={token} />} />
        <Route path="staff" element={<AdminStaff token={token!} />} />
        <Route path="staff/add" element={<AdminAddTechnician token={token!} />} />
        <Route path="staff/map" element={<AdminTechMap token={token!} />} />
        <Route path="banners" element={<AdminBanners token={token!} />} />
        <Route path="pricing" element={<AdminPricing token={token!} />} />
        <Route path="mart" element={<AdminMart token={token!} />} />
        <Route path="reviews" element={<AdminReviews token={token!} />} />
        <Route path="support" element={
          <AdminSupportQueue
            tickets={tickets}
            technicians={technicians}
            onAssignTicket={(ticketId, techId) => {
              setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTechId: techId, status: 'In Progress' as const } : t));
            }}
            onResolveTicket={(ticketId) => {
              setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Resolved' as const } : t));
            }}
          />
        } />
        <Route path="account" element={<AdminAccount token={token!} user={user} onSignOut={handleSignOut} />} />
      </Route>

      {/* Technician Routes */}
      <Route path="/technician" element={user.role !== 'technician' ? <Navigate to="/" replace /> : <TechnicianLayout user={user} onSignOut={handleSignOut} />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<TechnicianHome token={token} />} />
        <Route path="map" element={<TechnicianHome token={token} fullscreenMap={true} />} />
        <Route path="repairs/:repairId" element={<TechnicianRepairDetails token={token!} />} />
        <Route path="account" element={<ClientProfile user={user} token={token} onUserUpdate={(updatedUser) => setUser(updatedUser)} />} />
      </Route>
    </Routes>
  );
}

