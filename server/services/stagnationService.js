/**
 * Product Stagnation Detection Service
 * Feature 5: Detects underperforming products using statistical methods
 * (moving averages, z-scores) and suggests corrective actions.
 */

const Product = require('../models/Product');
const UserActivity = require('../models/UserActivity');

// ── Calculate Moving Average of Sales ───────────────────────────────
const calculateSalesMovingAvg = async (productId, windowDays = 7) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    const sales = await UserActivity.aggregate([
        {
            $match: {
                product: productId,
                type: 'purchase',
                timestamp: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
                },
                dailySales: { $sum: '$quantity' },
            },
        },
    ]);

    const totalSales = sales.reduce((sum, day) => sum + day.dailySales, 0);
    return totalSales / windowDays;
};

// ── Z-Score Calculation ─────────────────────────────────────────────
const calculateZScores = async () => {
    const products = await Product.find({});

    // Calculate sales velocity for each product
    const productSales = await Promise.all(
        products.map(async (product) => {
            const avg7  = await calculateSalesMovingAvg(product._id, 7);
            const avg30 = await calculateSalesMovingAvg(product._id, 30);
            return {
                product,
                salesAvg7: avg7,
                salesAvg30: avg30,
            };
        })
    );

    // Calculate mean and standard deviation of 7-day averages
    const values = productSales.map(ps => ps.salesAvg7);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance) || 1; // Avoid division by zero

    // Calculate z-scores
    return productSales.map(ps => ({
        ...ps,
        zScore: (ps.salesAvg7 - mean) / stdDev,
    }));
};

// ── Detect Stagnating Products ──────────────────────────────────────
const detectStagnation = async () => {
    const productStats = await calculateZScores();

    const results = productStats.map(ps => {
        const { product, salesAvg7, salesAvg30, zScore } = ps;
        let status = 'healthy';
        let actions = [];

        // Declining: 7-day avg significantly below 30-day avg, or z-score very low
        if (zScore < -1.5) {
            status = 'critical';
            actions = [
                { type: 'discount', suggestion: `Apply 20-25% discount on ${product.name}` },
                { type: 'removal', suggestion: `Consider removing ${product.name} from catalog` },
            ];
        } else if (zScore < -0.8) {
            status = 'declining';
            actions = [
                { type: 'discount', suggestion: `Apply 10-15% discount on ${product.name}` },
                { type: 'promotion', suggestion: `Feature ${product.name} in promotions` },
            ];
        } else if (zScore < -0.3) {
            status = 'watch';
            actions = [
                { type: 'promotion', suggestion: `Boost ${product.name} visibility` },
            ];
        } else if (zScore > 1.5) {
            status = 'trending';
            actions = [
                { type: 'stock', suggestion: `Increase stock for ${product.name}` },
                { type: 'price', suggestion: `Consider premium pricing for ${product.name}` },
            ];
        }

        return {
            productId: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            countInStock: product.countInStock,
            salesAvg7: Math.round(salesAvg7 * 100) / 100,
            salesAvg30: Math.round(salesAvg30 * 100) / 100,
            zScore: Math.round(zScore * 100) / 100,
            status,
            actions,
        };
    });

    // Sort: critical first, then declining, watch, healthy, trending
    const statusOrder = { critical: 0, declining: 1, watch: 2, healthy: 3, trending: 4 };
    results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return {
        summary: {
            total: results.length,
            critical: results.filter(r => r.status === 'critical').length,
            declining: results.filter(r => r.status === 'declining').length,
            watch: results.filter(r => r.status === 'watch').length,
            healthy: results.filter(r => r.status === 'healthy').length,
            trending: results.filter(r => r.status === 'trending').length,
        },
        products: results,
    };
};

module.exports = { detectStagnation, calculateZScores, calculateSalesMovingAvg };
