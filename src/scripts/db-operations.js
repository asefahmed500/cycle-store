import mongoose from 'mongoose';
import User from '../models/User';
import Order from '../models/Order';
import Bicycle from '../models/Bicycle';
import Payment from '../models/Payment';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function performDatabaseOperations() {
  try {
    // Create a user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    console.log('User created:', user);

    // Create a bicycle
    const bicycle = await Bicycle.create({
      name: 'Mountain Explorer',
      brand: 'PeakRider',
      price: 999.99,
      stock: 10,
      category: 'Mountain',
    });
    console.log('Bicycle created:', bicycle);

    // Create an order
    const order = await Order.create({
      user: user._id,
      items: [{ product: bicycle._id, quantity: 1, price: bicycle.price }],
      totalAmount: bicycle.price,
      shippingAddress: '123 Main St, City, Country',
    });
    console.log('Order created:', order);

    // Create a payment
    const payment = await Payment.create({
      order: order._id,
      amount: order.totalAmount,
      status: 'successful',
      paymentMethod: 'credit_card',
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
    });
    console.log('Payment created:', payment);

    // Update the order with payment info
    order.paymentInfo = payment._id;
    await order.save();

    // Fetch and display collections
    console.log('\nUsers:', await User.find());
    console.log('\nBicycles:', await Bicycle.find());
    console.log('\nOrders:', await Order.find().populate('user items.product paymentInfo'));
    console.log('\nPayments:', await Payment.find().populate('order'));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

performDatabaseOperations();

