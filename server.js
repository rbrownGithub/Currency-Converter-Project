const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Add this line before your route definitions
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Set up Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Define FavoritePair model
const FavoritePair = sequelize.define('FavoritePair', {
  baseCurrency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetCurrency: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Sync the model with the database
sequelize.sync();





app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.post('/api/favorites', async (req, res) => {
    try {
      console.log('Received favorite pair:', req.body);
      const { baseCurrency, targetCurrency } = req.body;
      const favoritePair = await FavoritePair.create({ baseCurrency, targetCurrency });
      console.log('Saved favorite pair:', favoritePair);
      res.json(favoritePair);
    } catch (error) {
      console.error('Error saving favorite pair:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  app.get('/api/favorites', async (req, res) => {
    try {
      const favoritePairs = await FavoritePair.findAll();
      console.log('Fetched favorite pairs:', favoritePairs);
      res.json(favoritePairs);
    } catch (error) {
      console.error('Error fetching favorite pairs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/favorites/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const deletedCount = await FavoritePair.destroy({
        where: { id: id }
      });
      if (deletedCount === 0) {
        res.status(404).json({ error: 'Favorite pair not found' });
      } else {
        res.json({ message: 'Favorite pair deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting favorite pair:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
sequelize.sync().then(() => {
    console.log('Database synchronized');
  }).catch((error) => {
    console.error('Error synchronizing database:', error);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});