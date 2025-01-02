const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const dbURI = 'mongodb+srv://fishybuisness:chandlerbing@fishshopcluster.yr7l3.mongodb.net/fish-shop?retryWrites=true&w=majority&tls=true';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error:', err));

// Schema for orders
const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  cart: Array,
});

const Order = mongoose.model('Order', orderSchema);

// Telegram Bot Info
const botToken = '7213087223:AAGLYj9gmxJ5YwQq7zbIz6DMNGhsx6jmp-k'; // Replace with your bot token
const chatId = '1159171573'; // Replace with the owner's chat ID

// Routes
app.post('/order', async (req, res) => {
  const { name, phone, cart } = req.body;

  const newOrder = new Order({ name, phone, cart });

  try {
    // Save order to database
    await newOrder.save();
    console.log('Order saved to database');

    // Send message to the owner via Telegram
    const telegramMessage = `New Order Received!\nName: ${name}\nPhone: ${phone}\nCart: ${JSON.stringify(cart, null, 2)}`;
    const telegramURL = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await axios.post(telegramURL, {
      chat_id: chatId,
      text: telegramMessage,
    });

    if (response.data.ok) {
      console.log('Telegram message sent:', response.data);
    } else {
      console.error('Failed to send Telegram message:', response.data);
    }

    res.json({ message: 'Order placed successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
