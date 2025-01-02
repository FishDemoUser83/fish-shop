require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema for orders
const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  cart: Array,
});

const Order = mongoose.model('Order', orderSchema);

// Routes
app.post('/order', async (req, res) => {
  const { name, phone, cart } = req.body;

  const newOrder = new Order({ name, phone, cart });
  try {
    await newOrder.save();
    res.json({ message: 'Order placed successfully!' });

    // Send a Telegram message
    const message = `New Order:\nName: ${name}\nPhone: ${phone}\nCart: ${JSON.stringify(cart)}`;
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to place order', error: err });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
