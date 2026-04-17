/**
 * Simulated user activity data for testing AI features.
 * This generates realistic activity patterns when seeded.
 */

const generateActivities = (users, products) => {
    const activities = [];
    const now = new Date();

    // Helper: random date within last N days
    const randomDate = (daysBack) => {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
        d.setHours(Math.floor(Math.random() * 24));
        return d;
    };

    // For each non-admin user, generate realistic activity
    const regularUsers = users.filter(u => !u.isAdmin);

    regularUsers.forEach(user => {
        // Generate 15-30 product views
        const viewCount = 15 + Math.floor(Math.random() * 16);
        for (let i = 0; i < viewCount; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            activities.push({
                user: user._id,
                product: product._id,
                type: 'view',
                timestamp: randomDate(30),
            });
        }

        // Generate 3-8 purchases
        const purchaseCount = 3 + Math.floor(Math.random() * 6);
        const purchasedProducts = [];
        for (let i = 0; i < purchaseCount; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            purchasedProducts.push(product);
            activities.push({
                user: user._id,
                product: product._id,
                type: 'purchase',
                quantity: 1 + Math.floor(Math.random() * 3),
                timestamp: randomDate(60),
            });
        }

        // Generate 2-5 ratings
        const ratingCount = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < ratingCount; i++) {
            const product = purchasedProducts[i % purchasedProducts.length];
            activities.push({
                user: user._id,
                product: product._id,
                type: 'rating',
                rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
                timestamp: randomDate(30),
            });
        }

        // Generate 2-4 cart additions
        const cartCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < cartCount; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            activities.push({
                user: user._id,
                product: product._id,
                type: 'cart_add',
                timestamp: randomDate(14),
            });
        }

        // Generate 1-3 searches
        const searches = ['espresso', 'sweet coffee', 'cold', 'traditional', 'strong'];
        const searchCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < searchCount; i++) {
            activities.push({
                user: user._id,
                type: 'search',
                searchQuery: searches[Math.floor(Math.random() * searches.length)],
                timestamp: randomDate(14),
            });
        }
    });

    return activities;
};

module.exports = { generateActivities };
