// components/WaiterView.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  User, 
  ChefHat, 
  Coffee, 
  CheckCircle,
  AlertCircle,
  Users,
  ClipboardList,
  RefreshCw,
  Package,
  Bell
} from 'lucide-react';

interface OrderItem {
  item_id: string;
  name: string;
  quantity: number;
  type: 'FOOD' | 'DRINK';
}

interface Order {
  id: string;
  status: 'PENDING' | 'ASSIGNED' | 'SERVED' | 'PAID';
  total_amount: string;
  estimated_wait_time: number;
  created_at: string;
  waiter_id: string | null;
  chef_id: string | null;
  bartender_id: string | null;
  items: OrderItem[];
}

interface Staff {
  id: string;
  name: string;
  role: 'WAITER' | 'CHEF' | 'BARTENDER';
}

const WaiterView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [ordersRes, staffRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/staff`)
      ]);
      setOrders(ordersRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, updates);
      fetchData();
    } catch (err) {
      alert("Failed to update order. Please try again.");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'status-pending';
      case 'ASSIGNED': return 'status-assigned';
      case 'SERVED': return 'status-served';
      case 'PAID': return 'status-paid';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'ASSIGNED': return <Users className="w-4 h-4" />;
      case 'SERVED': return <CheckCircle className="w-4 h-4" />;
      case 'PAID': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <AlertCircle className="w-12 h-12 text-terracotta" />
        <p>{error}</p>
        <button onClick={handleRefresh} className="retry-btn">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const assignedOrders = orders.filter(o => o.status === 'ASSIGNED').length;

  return (
    <div className="waiter-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Dashboard</h1>
          <p className="page-subtitle">Manage orders and coordinate with your team</p>
        </div>
        <div className="header-actions">
          <div className="order-stats">
            <span className="stat-badge pending">
              <Bell className="w-3 h-3" />
              {pendingOrders} Pending
            </span>
            <span className="stat-badge assigned">
              <Users className="w-3 h-3" />
              {assignedOrders} Assigned
            </span>
          </div>
          <button onClick={handleRefresh} className="refresh-btn" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="orders-list">
        <AnimatePresence>
          {orders.length === 0 ? (
            <div className="empty-state">
              <ClipboardList className="w-16 h-16 text-olive" />
              <p>No active orders</p>
              <span>Orders will appear here as customers place them</span>
            </div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`order-card ${getStatusColor(order.status)}`}
              >
                <div className="order-header">
                  <div className="order-id">
                    <span className="order-id-label">Order</span>
                    <span className="order-id-value">#{order.id.split('-')[0]}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <span className="order-time">
                      <Clock className="w-3 h-3" />
                      {order.estimated_wait_time} min
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-items">
                    <h4>Items</h4>
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span className="item-qty">{item.quantity}x</span>
                          <span className="item-name">{item.name}</span>
                          <span className={`item-type ${item.type.toLowerCase()}`}>
                            {item.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-assignments">
                    <h4>Assign Staff</h4>
                    <div className="assignment-grid">
                      <div className="assignment-field">
                        <label>
                          <User className="w-3 h-3" />
                          Waiter
                        </label>
                        <select 
                          value={order.waiter_id || ''} 
                          onChange={(e) => handleUpdateOrder(order.id, { waiter_id: e.target.value })}
                        >
                          <option value="">-- Unassigned --</option>
                          {staff.filter(s => s.role === 'WAITER').map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="assignment-field">
                        <label>
                          <ChefHat className="w-3 h-3" />
                          Chef
                        </label>
                        <select 
                          value={order.chef_id || ''} 
                          onChange={(e) => handleUpdateOrder(order.id, { chef_id: e.target.value })}
                        >
                          <option value="">-- Unassigned --</option>
                          {staff.filter(s => s.role === 'CHEF').map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="assignment-field">
                        <label>
                          <Coffee className="w-3 h-3" />
                          Bartender
                        </label>
                        <select 
                          value={order.bartender_id || ''} 
                          onChange={(e) => handleUpdateOrder(order.id, { bartender_id: e.target.value })}
                        >
                          <option value="">-- Unassigned --</option>
                          {staff.filter(s => s.role === 'BARTENDER').map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <span className="order-total">
                    Total: ₦{Number(order.total_amount).toLocaleString('en-NG')}
                  </span>
                  <span className="order-created">
                    {new Date(order.created_at).toLocaleTimeString('en-NG', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WaiterView;