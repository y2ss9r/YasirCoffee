/**
 * Analytics Service — AI Dashboard Data
 * Feature 7: Provides sales performance, profit analysis, demand forecasting,
 * stock alerts, and AI-generated insight text.
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

// ── Sales Performance ───────────────────────────────────────────────
const getSalesPerformance = async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({ createdAt: { $gte: startDate }, isPaid: true });
    const activities = await UserActivity.find({
        type: 'purchase',
        timestamp: { $gte: startDate },
    });

    // Daily sales from activities
    const dailySales = {};
    activities.forEach(a => {
        const day = a.timestamp.toISOString().split('T')[0];
        if (!dailySales[day]) dailySales[day] = { revenue: 0, orders: 0, units: 0 };
        dailySales[day].orders += 1;
        dailySales[day].units += a.quantity || 1;
    });

    // Total metrics
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalProfit = orders.reduce((sum, o) => {
        const orderProfit = o.orderItems.reduce((p, item) => {
            return p + (item.price - item.unitCost) * item.qty;
        }, 0);
        return sum + orderProfit;
    }, 0);

    return {
        period: `${days} days`,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        totalOrders: orders.length,
        avgOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
        profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
        dailySales: Object.entries(dailySales).map(([date, data]) => ({
            date,
            ...data,
        })).sort((a, b) => a.date.localeCompare(b.date)),
    };
};

// ── Top Products ────────────────────────────────────────────────────
const getTopProducts = async (limit = 5) => {
    const topByPurchase = await UserActivity.aggregate([
        { $match: { type: 'purchase' } },
        { $group: { _id: '$product', totalSold: { $sum: '$quantity' }, purchases: { $sum: 1 } } },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
    ]);

    return topByPurchase.map(item => ({
        productId: item._id,
        name: item.product.name,
        image: item.product.image,
        category: item.product.category,
        totalSold: item.totalSold,
        purchases: item.purchases,
        revenue: Math.round(item.totalSold * item.product.price * 100) / 100,
        profit: Math.round(item.totalSold * (item.product.price - item.product.unitCost) * 100) / 100,
    }));
};

// ── Demand Forecast (Simple Linear Regression) ──────────────────────
const getDemandForecast = async (productId, forecastDays = 7) => {
    const activities = await UserActivity.find({
        product: productId,
        type: 'purchase',
    }).sort({ timestamp: 1 });

    if (activities.length < 3) {
        return { forecast: [], confidence: 'low', message: 'Insufficient data' };
    }

    // Group by day
    const dailyData = {};
    activities.forEach(a => {
        const day = a.timestamp.toISOString().split('T')[0];
        dailyData[day] = (dailyData[day] || 0) + (a.quantity || 1);
    });

    const days = Object.keys(dailyData).sort();
    const values = days.map(d => dailyData[d]);
    const n = values.length;

    // Linear regression
    const sumX = values.reduce((s, _, i) => s + i, 0);
    const sumY = values.reduce((s, v) => s + v, 0);
    const sumXY = values.reduce((s, v, i) => s + i * v, 0);
    const sumX2 = values.reduce((s, _, i) => s + i * i, 0);

    const denom = n * sumX2 - sumX * sumX;
    const m = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const b = (sumY - m * sumX) / n;

    // Generate forecast
    const forecast = [];
    const lastDate = new Date(days[days.length - 1]);
    for (let i = 1; i <= forecastDays; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i);
        const predicted = Math.max(0, Math.round((m * (n + i) + b) * 10) / 10);
        forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            predictedDemand: predicted,
        });
    }

    return {
        forecast,
        trend: m > 0.1 ? 'increasing' : m < -0.1 ? 'decreasing' : 'stable',
        confidence: n >= 14 ? 'high' : n >= 7 ? 'medium' : 'low',
    };
};

// ── Stock Alerts ────────────────────────────────────────────────────
const getStockAlerts = async () => {
    const products = await Product.find({});
    const alerts = [];

    for (const product of products) {
        const weekPurchases = await UserActivity.countDocuments({
            product: product._id,
            type: 'purchase',
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });

        const dailyVelocity = weekPurchases / 7;
        const daysUntilStockout = dailyVelocity > 0 ? Math.floor(product.countInStock / dailyVelocity) : 999;

        if (daysUntilStockout < 14) {
            alerts.push({
                productId: product._id,
                name: product.name,
                currentStock: product.countInStock,
                dailyVelocity: Math.round(dailyVelocity * 10) / 10,
                daysUntilStockout,
                severity: daysUntilStockout < 3 ? 'critical' : daysUntilStockout < 7 ? 'warning' : 'info',
                suggestion: `Reorder ${Math.ceil(dailyVelocity * 30)} units to cover next 30 days`,
            });
        }
    }

    alerts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    return alerts;
};

// ── AI-Generated Insights ───────────────────────────────────────────
const generateInsights = async () => {
    const insights = [];
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    // Compare this week vs last week activity
    const thisWeekPurchases = await UserActivity.countDocuments({
        type: 'purchase', timestamp: { $gte: weekAgo },
    });
    const lastWeekPurchases = await UserActivity.countDocuments({
        type: 'purchase', timestamp: { $gte: twoWeeksAgo, $lt: weekAgo },
    });

    if (lastWeekPurchases > 0) {
        const changePct = Math.round(((thisWeekPurchases - lastWeekPurchases) / lastWeekPurchases) * 100);
        if (changePct > 0) {
            insights.push({ type: 'positive', text: `📈 Sales are up ${changePct}% compared to last week!` });
        } else if (changePct < -10) {
            insights.push({ type: 'warning', text: `📉 Sales dropped ${Math.abs(changePct)}% compared to last week.` });
        }
    }

    // New user growth
    const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    if (newUsers > 0) {
        insights.push({ type: 'info', text: `👋 ${newUsers} new user(s) joined this week.` });
    }

    // Top product insight
    const topProducts = await getTopProducts(1);
    if (topProducts.length > 0) {
        insights.push({ type: 'positive', text: `🏆 "${topProducts[0].name}" is your best seller with ${topProducts[0].totalSold} units sold.` });
    }

    // Stock alerts count
    const stockAlerts = await getStockAlerts();
    if (stockAlerts.length > 0) {
        const critical = stockAlerts.filter(a => a.severity === 'critical').length;
        insights.push({
            type: critical > 0 ? 'warning' : 'info',
            text: `📦 ${stockAlerts.length} product(s) need restocking${critical > 0 ? ` (${critical} critical!)` : ''}.`,
        });
    }

    return insights;
};

// ── Full Dashboard Data ─────────────────────────────────────────────
const getDashboardData = async () => {
    const [sales, topProducts, stockAlerts, insights, userCount, productCount] = await Promise.all([
        getSalesPerformance(30),
        getTopProducts(5),
        getStockAlerts(),
        generateInsights(),
        User.countDocuments(),
        Product.countDocuments(),
    ]);

    return {
        overview: {
            totalUsers: userCount,
            totalProducts: productCount,
            ...sales,
        },
        topProducts,
        stockAlerts,
        insights,
        generatedAt: new Date().toISOString(),
    };
};

module.exports = {
    getSalesPerformance,
    getTopProducts,
    getDemandForecast,
    getStockAlerts,
    generateInsights,
    getDashboardData,
};
