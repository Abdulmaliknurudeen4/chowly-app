import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. TypeScript Interfaces mapping to our backend
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

  // 2. Fetch Orders and Staff on load
  const fetchData = async () => {
    try {
      const [ordersRes, staffRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/staff`)
      ]);
      setOrders(ordersRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Set up a polling interval to auto-refresh orders every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // 3. Handle Order Updates (Status or Staff Assignment)
  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, updates);
      fetchData(); // Refresh the data to show the changes
    } catch (err) {
      alert("Failed to update order.");
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Waiter Dashboard 📋</h2>
      <p>Manage incoming orders and assign staff.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {orders.length === 0 ? <p>No active orders.</p> : orders.map((order) => (
          <div key={order.id} style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#fff' // Highlight pending orders
          }}>
            
            {/* Header: Order ID & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
              <strong>Order: {order.id.split('-')[0]}...</strong>
              <div>
                <span style={{ marginRight: '10px' }}>⏱ {order.estimated_wait_time} mins</span>
                <select 
                  value={order.status} 
                  onChange={(e) => handleUpdateOrder(order.id, { status: e.target.value as Order['status'] })}
                  style={{ padding: '5px', fontWeight: 'bold' }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="SERVED">SERVED</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
            </div>

            {/* Body: Items & Assignments */}
            <div style={{ display: 'flex', gap: '20px' }}>
              
              {/* Order Items List */}
              <div style={{ flex: 1 }}>
                <h4>Items Ordered:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.name} <small>({item.type})</small>
                    </li>
                  ))}
                </ul>
                <h4 style={{ marginTop: '10px' }}>Total: ₦{Number(order.total_amount).toLocaleString('en-NG')}</h4>
              </div>

              {/* Staff Assignment Dropdowns */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4>Assignments:</h4>
                
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Waiter:
                  <select 
                    value={order.waiter_id || ''} 
                    onChange={(e) => handleUpdateOrder(order.id, { waiter_id: e.target.value })}
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.filter(s => s.role === 'WAITER').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Chef:
                  <select 
                    value={order.chef_id || ''} 
                    onChange={(e) => handleUpdateOrder(order.id, { chef_id: e.target.value })}
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.filter(s => s.role === 'CHEF').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaiterView;