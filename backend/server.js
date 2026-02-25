require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collections');
const environmentRoutes = require('./routes/environments');
const historyRoutes = require('./routes/history');
const userRoutes = require('./routes/user');
const proxyRoutes = require('./routes/proxy');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/proxy', proxyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to PostgreSQL and start server
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connected to PostgreSQL');
    // Sync all models (creates tables if they don't exist)
    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ Database tables synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });
