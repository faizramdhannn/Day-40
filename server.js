require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const poolUsers = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'users',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const poolProducts = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'products',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

poolUsers.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error connecting to USERS database:', err.stack);
  }
  console.log('✅ Connected to database: users');
  release();
});

poolProducts.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error connecting to PRODUCTS database:', err.stack);
  }
  console.log('✅ Connected to database: products');
  release();
});

app.get('/users', async (req, res) => {
  try {
    const result = await poolUsers.query('SELECT * FROM users ORDER BY id');
    res.json({
      success: true,
      database: 'users',
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: err.message
    });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await poolUsers.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      database: 'users',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: err.message
    });
  }
});

app.get('/products', async (req, res) => {
  try {
    const result = await poolProducts.query('SELECT * FROM products ORDER BY id');
    res.json({
      success: true,
      database: 'products',
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: err.message
    });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await poolProducts.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      database: 'products',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: err.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'PostgreSQL API Server - Multi Database',
    status: 'running',
    databases: {
      users: 'Connected',
      products: 'Connected'
    },
    endpoints: {
      home: '/',
      allUsers: '/users',
      userById: '/users/:id',
      allProducts: '/products',
      productById: '/products/:id'
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`   - GET http://localhost:${port}/users`);
  console.log(`   - GET http://localhost:${port}/users/:id`);
  console.log(`   - GET http://localhost:${port}/products`);
  console.log(`   - GET http://localhost:${port}/products/:id`);
});