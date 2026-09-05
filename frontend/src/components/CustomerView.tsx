// components/CustomerView.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  CreditCard, 
  Star, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Trash2
} from 'lucide-react';

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
  const [rating, setRating] = useState<number>(5);
  const [complaintText, setComplaintText] = useState<string>('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu`);
        if (Array.isArray(response.data)) setMenuItems(response.data);
      } catch (err) {
        setError("Failed to load the menu. Please try again.");
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

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((c) => c.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((c) => 
          c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prevCart.filter((c) => c.id !== itemId);
    });
  };

  const handleClearCart = () => {
    setCart([]);
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
      setOrderStatus("Order placed successfully!");
      setCart([]);
      setIsCartOpen(false);
      setTimeout(() => setOrderStatus(null), 3000);
    } catch (err) {
      setOrderStatus("Failed to place order. Please try again.");
      setTimeout(() => setOrderStatus(null), 3000);
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
      setPaymentStatus("Payment Successful!");
    } catch (err) {
      setPaymentStatus("Payment failed. Please try again.");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!currentOrder) return;
    try {
      setFeedbackStatus("Submitting...");
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/orders/${currentOrder.id}/feedback`, {
        rating,
        complaint_text: complaintText
      });
      setFeedbackStatus("Thank you! Your feedback has been recorded.");
    } catch (err) {
      setFeedbackStatus("Failed to submit feedback. Please try again.");
    }
  };

  const handleStartNewOrder = () => {
    setCurrentOrder(null);
    setPaymentStatus(null);
    setFeedbackStatus(null);
    setRating(5);
    setComplaintText('');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading our delicious menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <AlertCircle className="w-12 h-12 text-terracotta" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="customer-view">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Our Menu</h1>
          <p className="page-subtitle">Freshly prepared with love, just for you</p>
        </div>
        <button 
          className="cart-trigger-btn"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="cart-count">{totalCartItems}</span>
        </button>
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {menuItems.map((item, index) => {
          const isInCart = cart.some(c => c.id === item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="menu-card"
            >
              <div className="menu-card-image">
                <img src={item.image_url} alt={item.name} />
                <span className="menu-card-type">{item.type}</span>
              </div>
              <div className="menu-card-content">
                <h3 className="menu-card-name">{item.name}</h3>
                <p className="menu-card-prep">
                  <Clock className="w-3 h-3" />
                  {item.prep_time_minutes} min
                </p>
                <div className="menu-card-footer">
                  <span className="menu-card-price">
                    ₦{Number(item.price).toLocaleString('en-NG')}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={currentOrder !== null && currentOrder.status !== 'PAID'}
                    className={`add-btn ${isInCart ? 'in-cart' : ''}`}
                  >
                    {isInCart ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="cart-overlay"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="cart-sidebar"
            >
              <div className="cart-header">
                <h2>Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="close-cart-btn">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {currentOrder ? (
                <div className="order-complete">
                  <CheckCircle className="w-16 h-16 text-sage" />
                  <h3>Order Complete!</h3>
                  <p>Order ID: <strong>{currentOrder.id.split('-')[0]}</strong></p>
                  <h4>Total Due: ₦{Number(currentOrder.total_amount).toLocaleString('en-NG')}</h4>
                  
                  {currentOrder.status === 'PAID' ? (
                    <div className="feedback-section">
                      <p className="feedback-title">How was your experience?</p>
                      {feedbackStatus?.includes('Thank you') ? (
                        <div className="feedback-success">
                          <CheckCircle className="w-8 h-8" />
                          <p>{feedbackStatus}</p>
                        </div>
                      ) : (
                        <>
                          <div className="rating-select">
                            <label>Rating</label>
                            <select 
                              value={rating} 
                              onChange={(e) => setRating(Number(e.target.value))}
                            >
                              <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                              <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                              <option value={3}>⭐⭐⭐ (3/5)</option>
                              <option value={2}>⭐⭐ (2/5)</option>
                              <option value={1}>⭐ (1/5)</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Any complaints or compliments? (Optional)"
                            value={complaintText}
                            onChange={(e) => setComplaintText(e.target.value)}
                            className="feedback-textarea"
                          />
                          <button onClick={handleFeedbackSubmit} className="feedback-submit-btn">
                            <Send className="w-4 h-4" />
                            Submit Feedback
                          </button>
                          {feedbackStatus && <p className="feedback-error">{feedbackStatus}</p>}
                        </>
                      )}
                      <button onClick={handleStartNewOrder} className="new-order-btn">
                        Start New Order
                      </button>
                    </div>
                  ) : (
                    <div className="payment-section">
                      <button onClick={handlePayment} className="pay-btn">
                        <CreditCard className="w-4 h-4" />
                        {paymentStatus === "Processing..." ? "Processing..." : "Pay Now (Simulation)"}
                      </button>
                      {paymentStatus && <p className="payment-status">{paymentStatus}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <ShoppingCart className="w-16 h-16 text-olive" />
                      <p>Your cart is empty</p>
                      <span>Add some delicious items from our menu</span>
                    </div>
                  ) : (
                    <>
                      <div className="cart-items">
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="cart-item"
                          >
                            <div className="cart-item-info">
                              <span className="cart-item-name">{item.name}</span>
                              <span className="cart-item-price">
                                ₦{(Number(item.price) * item.quantity).toLocaleString('en-NG')}
                              </span>
                            </div>
                            <div className="cart-item-controls">
                              <button onClick={() => handleRemoveFromCart(item.id)}>
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="cart-item-qty">{item.quantity}</span>
                              <button onClick={() => handleAddToCart(item)}>
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="cart-footer">
                        <div className="cart-total">
                          <span>Total</span>
                          <span>₦{cartTotal.toLocaleString('en-NG')}</span>
                        </div>
                        <div className="cart-actions">
                          <button onClick={handleClearCart} className="clear-cart-btn">
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </button>
                          <button onClick={handleCheckout} className="checkout-btn">
                            Checkout Now
                          </button>
                        </div>
                        {orderStatus && (
                          <p className={`order-status ${orderStatus.includes('Failed') ? 'error' : 'success'}`}>
                            {orderStatus}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerView;