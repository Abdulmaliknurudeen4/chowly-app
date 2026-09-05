// components/ManagerView.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  order_id: string;
  rating: number;
  complaint_text: string | null;
  created_at: string;
  total_amount: string;
}

const ManagerView = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/feedback`);
        setFeedbacks(response.data);
      } catch (err) {
        setError("Failed to load feedback data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const filteredFeedbacks = feedbacks.filter(item => {
    if (filter === 'positive') return item.rating >= 4;
    if (filter === 'negative') return item.rating <= 2;
    return true;
  });

  const stats = {
    total: feedbacks.length,
    average: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0,
    positive: feedbacks.filter(f => f.rating >= 4).length,
    negative: feedbacks.filter(f => f.rating <= 2).length,
    withComments: feedbacks.filter(f => f.complaint_text).length,
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading feedback analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <AlertTriangle className="w-12 h-12 text-terracotta" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="manager-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback Analytics</h1>
          <p className="page-subtitle">Monitor customer satisfaction and operational insights</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(29, 76, 52, 0.1)' }}>
            <MessageSquare className="w-5 h-5 text-dark-green" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(159, 175, 145, 0.2)' }}>
            <Star className="w-5 h-5 text-sage" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.average}</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(201, 138, 114, 0.15)' }}>
            <ThumbsUp className="w-5 h-5 text-terracotta" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.positive}</span>
            <span className="stat-label">Positive Reviews</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="stat-card"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(201, 138, 114, 0.1)' }}>
            <ThumbsDown className="w-5 h-5 text-terracotta" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.negative}</span>
            <span className="stat-label">Needs Improvement</span>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="feedback-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Reviews
        </button>
        <button 
          className={`filter-btn ${filter === 'positive' ? 'active' : ''}`}
          onClick={() => setFilter('positive')}
        >
          <ThumbsUp className="w-4 h-4" />
          Positive
        </button>
        <button 
          className={`filter-btn ${filter === 'negative' ? 'active' : ''}`}
          onClick={() => setFilter('negative')}
        >
          <ThumbsDown className="w-4 h-4" />
          Needs Attention
        </button>
      </div>

      {/* Feedback List */}
      <div className="feedback-list">
        <AnimatePresence>
          {filteredFeedbacks.length === 0 ? (
            <div className="empty-state">
              <MessageSquare className="w-16 h-16 text-olive" />
              <p>No {filter !== 'all' ? filter : ''} feedback available</p>
            </div>
          ) : (
            filteredFeedbacks.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`feedback-card ${item.rating <= 2 ? 'negative' : ''}`}
              >
                <div className="feedback-header">
                  <div className="feedback-rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < item.rating ? 'filled' : ''}`}
                      />
                    ))}
                    <span className="feedback-rating-text">{item.rating}/5</span>
                  </div>
                  <div className="feedback-meta">
                    <span className="feedback-order">
                      Order #{item.order_id.split('-')[0]}
                    </span>
                    <span className="feedback-date">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="feedback-body">
                  <p className="feedback-comment">
                    {item.complaint_text || "No written feedback provided."}
                  </p>
                </div>

                <div className="feedback-footer">
                  <span className="feedback-amount">
                    Order Value: ₦{Number(item.total_amount).toLocaleString('en-NG')}
                  </span>
                  {item.rating <= 2 && (
                    <span className="feedback-badge negative">
                      <AlertTriangle className="w-3 h-3" />
                      Needs Review
                    </span>
                  )}
                  {item.rating >= 4 && (
                    <span className="feedback-badge positive">
                      <CheckCircle className="w-3 h-3" />
                      Satisfied
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManagerView;