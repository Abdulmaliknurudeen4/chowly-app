const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Allows parsing of JSON bodies

// GET /api/menu: Fetch all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM MenuItems ORDER BY type, name');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error retrieving menu' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Chowly API running on port ${PORT}`);
});

// POST /api/orders: Create a new order and its items
app.post('/api/orders', async (req, res) => {
  const { total_amount, estimated_wait_time, items } = req.body;

  // Basic validation
  if (!items || items.length === 0 || !total_amount || !estimated_wait_time) {
    return res.status(400).json({ error: 'Missing required order fields.' });
  }

  const client = await db.getClient(); // Check out a client from the pool

  try {
    await client.query('BEGIN'); // Start the transaction

    // 1. Insert the main order record
    const orderInsertQuery = `
      INSERT INTO Orders (total_amount, estimated_wait_time)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const orderResult = await client.query(orderInsertQuery, [total_amount, estimated_wait_time]);
    const newOrder = orderResult.rows[0];

    // 2. Loop through the cart and insert the individual order items
    const orderItemsQuery = `
      INSERT INTO OrderItems (order_id, menu_item_id, quantity)
      VALUES ($1, $2, $3);
    `;
    for (let item of items) {
      await client.query(orderItemsQuery, [newOrder.id, item.menu_item_id, item.quantity]);
    }

    await client.query('COMMIT'); // Save everything if successful
    
    res.status(201).json({ 
        message: 'Order placed successfully', 
        order: newOrder 
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Undo all changes if an error occurs
    console.error('Transaction Error:', err.message);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release(); // Return the client to the pool
  }
});

// GET /api/orders: Retrieve active orders for the Waiter Dashboard
app.get('/api/orders', async (req, res) => {
  try {
    // This query fetches the order and bundles the related items into a JSON array
    const query = `
      SELECT 
        o.id, 
        o.status, 
        o.total_amount, 
        o.estimated_wait_time, 
        o.created_at,
        o.waiter_id, 
        o.chef_id, 
        o.bartender_id,
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'item_id', oi.id,
              'name', mi.name,
              'quantity', oi.quantity,
              'type', mi.type
            ))
            FROM OrderItems oi
            JOIN MenuItems mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = o.id
          ), '[]'::json
        ) AS items
      FROM Orders o
      ORDER BY 
        CASE 
          WHEN o.status = 'PENDING' THEN 1
          WHEN o.status = 'ASSIGNED' THEN 2
          WHEN o.status = 'SERVED' THEN 3
          ELSE 4
        END,
        o.created_at DESC;
    `;

    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Server error retrieving orders' });
  }
});

// PUT /api/orders/:id: Update order status and staff assignments
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, waiter_id, chef_id, bartender_id } = req.body;

  try {
    // Dynamically build the update query so we only overwrite provided fields
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (status) {
      fields.push(`status = $${queryIndex++}`);
      values.push(status);
    }
    // We check against undefined so we can explicitly pass null to unassign if ever needed
    if (waiter_id !== undefined) { 
      fields.push(`waiter_id = $${queryIndex++}`);
      values.push(waiter_id);
    }
    if (chef_id !== undefined) {
      fields.push(`chef_id = $${queryIndex++}`);
      values.push(chef_id);
    }
    if (bartender_id !== undefined) {
      fields.push(`bartender_id = $${queryIndex++}`);
      values.push(bartender_id);
    }

    // Prevent executing an empty update query
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    // Add the order ID as the final parameter for the WHERE clause
    values.push(id);
    
    const query = `
      UPDATE Orders 
      SET ${fields.join(', ')} 
      WHERE id = $${queryIndex} 
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ 
        message: 'Order updated successfully', 
        order: rows[0] 
    });

  } catch (err) {
    console.error('Error updating order:', err.message);
    res.status(500).json({ error: 'Server error updating order' });
  }
});

// GET /api/staff: Fetch all staff members (Waiters, Chefs, Bartenders)
app.get('/api/staff', async (req, res) => {
  try {
    // We order by role first, then name, making it easier to group on the frontend
    const query = `
      SELECT id, name, role 
      FROM Staff 
      ORDER BY role, name;
    `;
    
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching staff:', err.message);
    res.status(500).json({ error: 'Server error retrieving staff list' });
  }
});

// POST /api/orders/:id/pay: Process pretend payment
app.post('/api/orders/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Payment amount is required' });
  }

  const client = await db.getClient(); // Check out client for transaction

  try {
    await client.query('BEGIN');

    // 1. Insert the simulated payment record
    const paymentQuery = `
      INSERT INTO Payments (order_id, amount, is_pretend, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    // We hardcode is_pretend to true and status to 'COMPLETED' for the simulation
    const paymentResult = await client.query(paymentQuery, [id, amount, true, 'COMPLETED']);

    // 2. Update the Order status to 'PAID'
    const orderQuery = `
      UPDATE Orders 
      SET status = 'PAID' 
      WHERE id = $1 
      RETURNING *;
    `;
    const orderResult = await client.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      throw new Error('ORDER_NOT_FOUND');
    }

    await client.query('COMMIT'); // Commit both operations

    res.status(200).json({ 
        message: 'Payment processed successfully', 
        payment: paymentResult.rows[0],
        order: orderResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Cancel everything if an error occurs
    
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.error('Payment Error:', err.message);
    res.status(500).json({ error: 'Server error processing payment' });
  } finally {
    client.release();
  }
});

// POST /api/orders/:id/feedback: Submit rating and complaint
app.post('/api/orders/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { rating, complaint_text } = req.body;

  // Validate the rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'A valid rating between 1 and 5 is required.' });
  }

  try {
    const query = `
      INSERT INTO Feedback (order_id, rating, complaint_text)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const { rows } = await db.query(query, [id, rating, complaint_text]);

    res.status(201).json({ 
        message: 'Feedback submitted successfully', 
        feedback: rows[0] 
    });

  } catch (err) {
    console.error('Error submitting feedback:', err.message);
    
    // Postgres error code '23503' means a foreign key violation (the order ID doesn't exist)
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Order not found.' });
    }
    
    res.status(500).json({ error: 'Server error submitting feedback.' });
  }
});

// GET /api/feedback: Retrieve all customer feedback and ratings
app.get('/api/feedback', async (req, res) => {
  try {
    // We order by created_at DESC to see the newest feedback first
    const query = `
      SELECT 
        f.id, 
        f.order_id, 
        f.rating, 
        f.complaint_text, 
        f.created_at,
        o.total_amount
      FROM Feedback f
      JOIN Orders o ON f.order_id = o.id
      ORDER BY f.created_at DESC;
    `;
    
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching feedback:', err.message);
    res.status(500).json({ error: 'Server error retrieving feedback list' });
  }
});