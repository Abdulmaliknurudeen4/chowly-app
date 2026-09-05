import { useState, useEffect } from 'react';
import axios from 'axios';

export interface MenuItem {
  id: string;
  name: string;
  type: 'FOOD' | 'DRINK';
  price: string;
  prep_time_minutes: number;
  image_url: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface PlacedOrder {
  id: string;
  total_amount: string;
  status: string;
}

const CustomerView = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PlacedOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // 1. New states for Feedback
  const [rating, setRating] = useState<number>(5);
  const [complaintText, setComplaintText] = useState<string>('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu`);
        if (Array.isArray(response.data)) setMenuItems(response.data);
      } catch (err) {
        setError("Failed to load the menu.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((c) => c.id === item.id);
      if (existingItem) {
        return prevCart.map((c) => 
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const maxWaitTime = Math.max(...cart.map(item => item.prep_time_minutes), 15);
    const payload = {
      total_amount: cartTotal,
      estimated_wait_time: maxWaitTime,
      items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
    };

    try {
      setOrderStatus("Placing order...");
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/orders`, payload);
      setCurrentOrder(response.data.order);
      setOrderStatus("Order placed successfully! 🚀");
      setCart([]); 
      setTimeout(() => setOrderStatus(null), 3000);
    } catch (err) {
      setOrderStatus("Failed to place order. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!currentOrder) return;
    try {
      setPaymentStatus("Processing...");
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/orders/${currentOrder.id}/pay`, {
        amount: currentOrder.total_amount
      });
      setCurrentOrder({ ...currentOrder, status: response.data.order.status });
      setPaymentStatus("Payment Successful! 🎉");
    } catch (err) {
      setPaymentStatus("Payment failed. Please try again.");
    }
  };

  // 2. Handle Feedback Submission
  const handleFeedbackSubmit = async () => {
    if (!currentOrder) return;
    try {
      setFeedbackStatus("Submitting...");
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/orders/${currentOrder.id}/feedback`, {
        rating,
        complaint_text: complaintText
      });
      setFeedbackStatus("Thank you! Your feedback has been recorded. ❤️");
    } catch (err) {
      setFeedbackStatus("Failed to submit feedback.");
    }
  };

  // 3. Reset everything for a new order
  const handleStartNewOrder = () => {
    setCurrentOrder(null);
    setPaymentStatus(null);
    setFeedbackStatus(null);
    setRating(5);
    setComplaintText('');
  };

  if (loading) return <div>Loading the deliciousness...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '30px' }}>
      
      {/* LEFT COLUMN: Menu Grid */}
      <div style={{ flex: '2' }}>
        <h2>Our Menu</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {menuItems.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <div style={{ height: '120px', backgroundColor: '#eee', backgroundImage: `url(${item.image_url})`, backgroundSize: 'cover', borderRadius: '6px' }} />
              <h3>{item.name}</h3>
              <h2 style={{ margin: '10px 0', color: '#2c3e50' }}>₦{Number(item.price).toLocaleString('en-NG')}</h2>
              <button 
                onClick={() => handleAddToCart(item)}
                disabled={currentOrder !== null && currentOrder.status !== 'PAID'} 
                style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: currentOrder && currentOrder.status !== 'PAID' ? 0.5 : 1 }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart, Payment, OR Feedback UI */}
      <div style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
        
        {currentOrder ? (
          <div>
            <h2>Order Complete! 🍽️</h2>
            <p>Your order ID is: <strong>{currentOrder.id.split('-')[0]}</strong></p>
            <h3 style={{ margin: '20px 0' }}>Total Due: ₦{Number(currentOrder.total_amount).toLocaleString('en-NG')}</h3>
            
            {currentOrder.status === 'PAID' ? (
              <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ color: '#2e7d32', marginTop: 0 }}>{paymentStatus}</h3>
                <p>While you wait, how was your experience?</p>
                
                {/* 4. Feedback Form UI */}
                {feedbackStatus?.includes('Thank you') ? (
                  <p style={{ fontWeight: 'bold', color: '#e67e22' }}>{feedbackStatus}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    <label>
                      <strong>Rating: </strong>
                      <select 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))}
                        style={{ padding: '5px', borderRadius: '4px' }}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                        <option value={2}>⭐⭐ (2/5)</option>
                        <option value={1}>⭐ (1/5)</option>
                      </select>
                    </label>
                    <textarea 
                      placeholder="Any complaints or compliments? (Optional)"
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      style={{ padding: '10px', borderRadius: '4px', minHeight: '60px', width: '90%' }}
                    />
                    <button 
                      onClick={handleFeedbackSubmit}
                      style={{ padding: '10px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Submit Feedback
                    </button>
                    {feedbackStatus && <p style={{ color: 'red', margin: 0 }}>{feedbackStatus}</p>}
                  </div>
                )}

                <button 
                  onClick={handleStartNewOrder}
                  style={{ marginTop: '25px', width: '100%', padding: '12px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Start New Order
                </button>
              </div>
            ) : (
              <div>
                <button 
                  onClick={handlePayment}
                  style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  {paymentStatus === "Processing..." ? "Processing..." : "Pay Now (Simulation)"}
                </button>
                {paymentStatus && <p style={{ color: 'red', marginTop: '10px' }}>{paymentStatus}</p>}
              </div>
            )}
          </div>
        ) : (
          /* Standard Cart UI */
          <div>
            <h2>Your Cart 🛒</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>₦{(Number(item.price) * item.quantity).toLocaleString('en-NG')}</span>
                  </div>
                ))}
                <h3 style={{ textAlign: 'right', marginTop: '20px' }}>
                  Total: ₦{cartTotal.toLocaleString('en-NG')}
                </h3>
                <button 
                  onClick={handleCheckout}
                  style={{ width: '100%', padding: '15px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  Checkout Now
                </button>
                {orderStatus && <p style={{ marginTop: '15px', fontWeight: 'bold', color: orderStatus.includes('Failed') ? 'red' : 'green' }}>{orderStatus}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerView;