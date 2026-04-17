const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const { generateActivities } = require('./data/activities');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const UserActivity = require('./models/UserActivity');
const Subscription = require('./models/Subscription');
const Offer = require('./models/Offer');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        // Clear all collections
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await UserActivity.deleteMany();
        await Subscription.deleteMany();
        await Offer.deleteMany();

        // Seed users
        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;

        // Update non-admin users with default taste profiles
        for (const user of createdUsers) {
            if (!user.isAdmin) {
                user.tasteProfile = {
                    bitterness: 4 + Math.floor(Math.random() * 4),
                    acidity: 3 + Math.floor(Math.random() * 4),
                    roastLevel: 4 + Math.floor(Math.random() * 4),
                    body: 4 + Math.floor(Math.random() * 4),
                    sweetness: 3 + Math.floor(Math.random() * 5),
                };
                await user.save();
            }
        }

        // Seed products with admin user reference
        const sampleProducts = products.map((product) => ({
            ...product,
            user: adminUser,
        }));
        const createdProducts = await Product.insertMany(sampleProducts);

        // Seed simulated user activities
        const activities = generateActivities(createdUsers, createdProducts);
        if (activities.length > 0) {
            await UserActivity.insertMany(activities);
        }

        // Create a sample subscription for the regular user
        const regularUser = createdUsers.find(u => !u.isAdmin);
        if (regularUser) {
            const nextDelivery = new Date();
            nextDelivery.setDate(nextDelivery.getDate() + 30);

            await Subscription.create({
                user: regularUser._id,
                name: 'Morning Essentials',
                frequency: 'monthly',
                products: [
                    { product: createdProducts[2]._id, quantity: 2 }, // Espresso
                    { product: createdProducts[3]._id, quantity: 1 }, // Cappuccino
                ],
                status: 'active',
                autoAdjust: true,
                nextDelivery,
                shippingAddress: {
                    address: '123 Coffee Street',
                    city: 'Istanbul',
                    postalCode: '34000',
                    country: 'Turkey',
                },
            });

            // Create a sample personalized offer
            const offerExpiry = new Date();
            offerExpiry.setDate(offerExpiry.getDate() + 7);

            await Offer.create({
                user: regularUser._id,
                title: 'Welcome Back! 15% Off',
                description: 'We noticed you haven\'t ordered in a while. Here\'s a special discount!',
                discountPct: 15,
                reason: 'inactivity',
                products: [createdProducts[0]._id, createdProducts[6]._id],
                expiresAt: offerExpiry,
            });

            await Offer.create({
                user: regularUser._id,
                title: 'Try Something New — 10% Off Cold Brew',
                description: 'Based on your taste profile, we think you\'d love our Cold Brew!',
                discountPct: 10,
                reason: 'cross_sell',
                products: [createdProducts[9]._id],
                expiresAt: offerExpiry,
            });
        }

        console.log('✅ Data Imported Successfully!');
        console.log(`   - ${createdUsers.length} users`);
        console.log(`   - ${createdProducts.length} products (with Coffee DNA)`);
        console.log(`   - ${activities.length} user activities`);
        console.log(`   - 1 subscription`);
        console.log(`   - 2 personalized offers`);
        process.exit();
    } catch (error) {
        console.error(`❌ Seeder Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await UserActivity.deleteMany();
        await Subscription.deleteMany();
        await Offer.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
