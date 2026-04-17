/**
 * Coffee Quiz Service
 * Feature 9: Interactive quiz that determines a user's ideal coffee profile
 * and links results to product recommendations.
 */

const Product = require('../models/Product');
const { cosineSimilarity } = require('./chatbotService');

// ── Quiz Questions ──────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: 'How do you start your morning?',
        options: [
            { text: 'I need a strong kick to wake up', icon: '⚡', weights: { bitterness: 8, roastLevel: 8, body: 7 } },
            { text: 'Something smooth and gentle', icon: '🌅', weights: { bitterness: 3, roastLevel: 4, body: 4 } },
            { text: 'A sweet treat to start the day', icon: '🍰', weights: { sweetness: 8, bitterness: 2, body: 5 } },
            { text: 'I skip coffee in the morning', icon: '😴', weights: { bitterness: 5, roastLevel: 5, body: 5 } },
        ],
    },
    {
        id: 2,
        question: 'How do you feel about dark chocolate?',
        options: [
            { text: 'Love it — the darker the better', icon: '🍫', weights: { bitterness: 9, sweetness: 2 } },
            { text: 'I prefer milk chocolate', icon: '🥛', weights: { bitterness: 4, sweetness: 6 } },
            { text: 'White chocolate is my thing', icon: '🤍', weights: { bitterness: 1, sweetness: 9 } },
            { text: 'I\'m not a chocolate person', icon: '🤷', weights: { bitterness: 5, sweetness: 5 } },
        ],
    },
    {
        id: 3,
        question: 'Pick a vacation destination:',
        options: [
            { text: 'Istanbul — rich history and culture', icon: '🕌', weights: { roastLevel: 8, body: 8, bitterness: 7 } },
            { text: 'Bali — tropical and refreshing', icon: '🏝️', weights: { acidity: 7, sweetness: 6, body: 3 } },
            { text: 'Paris — elegant and refined', icon: '🗼', weights: { roastLevel: 6, acidity: 4, body: 6 } },
            { text: 'Tokyo — modern and precise', icon: '🏯', weights: { acidity: 5, body: 5, roastLevel: 5 } },
        ],
    },
    {
        id: 4,
        question: 'What\'s your ideal dessert?',
        options: [
            { text: 'Tiramisu', icon: '🍰', weights: { bitterness: 6, sweetness: 7, body: 7 } },
            { text: 'Fresh fruit salad', icon: '🍓', weights: { acidity: 8, sweetness: 5, body: 2 } },
            { text: 'Baklava', icon: '🍯', weights: { sweetness: 9, body: 6, bitterness: 2 } },
            { text: 'Cheese & crackers', icon: '🧀', weights: { bitterness: 5, acidity: 4, body: 5 } },
        ],
    },
    {
        id: 5,
        question: 'How much milk in your coffee?',
        options: [
            { text: 'None — black all the way', icon: '⬛', weights: { bitterness: 9, body: 8, sweetness: 1 } },
            { text: 'Just a splash', icon: '💧', weights: { bitterness: 6, body: 6, sweetness: 4 } },
            { text: 'Half and half', icon: '⚖️', weights: { bitterness: 4, body: 5, sweetness: 5 } },
            { text: 'Lots of milk please', icon: '🥛', weights: { bitterness: 2, body: 3, sweetness: 7 } },
        ],
    },
    {
        id: 6,
        question: 'What music do you listen to while working?',
        options: [
            { text: 'Jazz — smooth and complex', icon: '🎷', weights: { body: 7, acidity: 5, roastLevel: 6 } },
            { text: 'Pop — upbeat and energetic', icon: '🎵', weights: { sweetness: 7, acidity: 6, body: 4 } },
            { text: 'Rock — bold and intense', icon: '🎸', weights: { bitterness: 8, roastLevel: 8, body: 8 } },
            { text: 'Lo-fi — chill and balanced', icon: '🎧', weights: { body: 5, sweetness: 5, acidity: 4 } },
        ],
    },
    {
        id: 7,
        question: 'What time do you usually have your last coffee?',
        options: [
            { text: 'Before noon', icon: '☀️', weights: { bitterness: 7, roastLevel: 7, body: 7 } },
            { text: 'Early afternoon', icon: '🌤️', weights: { bitterness: 5, roastLevel: 5, body: 5 } },
            { text: 'Evening', icon: '🌙', weights: { bitterness: 3, acidity: 2, sweetness: 6 } },
            { text: 'I drink coffee all day', icon: '♾️', weights: { bitterness: 6, roastLevel: 6, body: 6 } },
        ],
    },
    {
        id: 8,
        question: 'Pick a word that resonates with you:',
        options: [
            { text: 'Bold', icon: '💪', weights: { bitterness: 9, roastLevel: 9, body: 8 } },
            { text: 'Smooth', icon: '🧈', weights: { body: 7, sweetness: 5, acidity: 2 } },
            { text: 'Bright', icon: '✨', weights: { acidity: 8, sweetness: 4, body: 3 } },
            { text: 'Cozy', icon: '🧣', weights: { body: 6, sweetness: 7, roastLevel: 5 } },
        ],
    },
];

// ── Calculate Quiz Results ──────────────────────────────────────────
const calculateQuizResults = async (answers) => {
    // answers = [{ questionId: 1, optionIndex: 0 }, ...]
    const profile = { bitterness: 0, acidity: 0, roastLevel: 0, body: 0, sweetness: 0 };
    const counts = { bitterness: 0, acidity: 0, roastLevel: 0, body: 0, sweetness: 0 };

    answers.forEach(answer => {
        const question = QUIZ_QUESTIONS.find(q => q.id === answer.questionId);
        if (!question) return;

        const option = question.options[answer.optionIndex];
        if (!option) return;

        Object.entries(option.weights).forEach(([dim, value]) => {
            profile[dim] += value;
            counts[dim] += 1;
        });
    });

    // Average across all contributing answers
    Object.keys(profile).forEach(dim => {
        profile[dim] = counts[dim] > 0
            ? Math.round((profile[dim] / counts[dim]) * 10) / 10
            : 5;
    });

    // Find matching products
    const products = await Product.find({});
    const userVec = [profile.bitterness, profile.acidity, profile.roastLevel, profile.body, profile.sweetness];

    const matches = products.map(p => {
        const productVec = [
            p.coffeeDNA.bitterness,
            p.coffeeDNA.acidity,
            p.coffeeDNA.roastLevel,
            p.coffeeDNA.body,
            p.coffeeDNA.sweetness,
        ];
        return {
            product: {
                _id: p._id,
                name: p.name,
                image: p.image,
                price: p.price,
                slug: p.slug,
                category: p.category,
                description: p.description,
                coffeeDNA: p.coffeeDNA,
            },
            similarity: Math.round(cosineSimilarity(userVec, productVec) * 100),
        };
    }).sort((a, b) => b.similarity - a.similarity);

    // Generate personality label
    const personality = getCoffeePersonality(profile);

    return {
        profile,
        personality,
        topMatches: matches.slice(0, 3),
        allMatches: matches,
    };
};

// ── Coffee Personality Label ────────────────────────────────────────
const getCoffeePersonality = (profile) => {
    if (profile.bitterness >= 7 && profile.body >= 7) {
        return { label: 'The Purist', emoji: '⬛', description: 'You appreciate coffee in its most intense form. Bold, strong, and unapologetic.' };
    }
    if (profile.sweetness >= 7) {
        return { label: 'The Sweet Tooth', emoji: '🍯', description: 'You love your coffee with a sweet twist. Life is too short for bitter drinks!' };
    }
    if (profile.acidity >= 7) {
        return { label: 'The Explorer', emoji: '🌍', description: 'You appreciate bright, fruity notes. Always seeking the next interesting flavor.' };
    }
    if (profile.roastLevel >= 7) {
        return { label: 'The Traditionalist', emoji: '🏛️', description: 'You respect the classics. A deep-roasted, rich coffee is your daily ritual.' };
    }
    if (profile.body >= 6 && profile.sweetness >= 5) {
        return { label: 'The Comfort Seeker', emoji: '🧣', description: 'You love a cozy, full-bodied cup with just the right amount of sweetness.' };
    }
    return { label: 'The Balanced Brewer', emoji: '⚖️', description: 'You appreciate harmony in your cup. Not too strong, not too mild — just right.' };
};

module.exports = {
    QUIZ_QUESTIONS,
    calculateQuizResults,
    getCoffeePersonality,
};
