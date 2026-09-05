import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the TypeScript interface for our feedback data
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

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/feedback`);
        setFeedbacks(response.data);
      } catch (err) {
        setError("Failed to load feedback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Manager Dashboard 📊</h2>
      <p>Review customer feedback and complaints below.</p>

      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {feedbacks.length === 0 ? (
          <p>No feedback received yet.</p>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: item.rating <= 2 ? '#ffebee' : '#f9f9f9', // Highlight bad reviews in light red
              borderLeft: item.rating <= 2 ? '5px solid #f44336' : '5px solid #4caf50'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>
                  Rating: {'⭐'.repeat(item.rating)} ({item.rating}/5)
                </h3>
                <span style={{ color: '#666' }}>
                  {new Date(item.created_at).toLocaleString('en-NG')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <strong>Customer Comments:</strong>
                  <p style={{ 
                    fontStyle: item.complaint_text ? 'normal' : 'italic',
                    color: item.complaint_text ? '#333' : '#999',
                    marginTop: '5px'
                  }}>
                    {item.complaint_text || "No written feedback provided."}
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <small style={{ color: '#666' }}>Order ID: {item.order_id.split('-')[0]}</small>
                  <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>
                    Order Value: ₦{Number(item.total_amount).toLocaleString('en-NG')}
                  </p>
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerView;