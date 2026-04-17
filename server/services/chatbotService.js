/**
 * AI Coffee Assistant — Chatbot Service
 * Feature 1: Rule-based conversational engine that recommends coffee
 * based on user preferences through an interactive conversation flow.
 */

const Product = require('../models/Product');

// ── Conversation State Machine ──────────────────────────────────────
const CONVERSATION_STATES = {
    GREETING:    'greeting',
    ASK_STRENGTH:'ask_strength',
    ASK_SWEET:   'ask_sweetness',
    ASK_FLAVOR:  'ask_flavor',
    ASK_TIME:    'ask_time',
    RECOMMEND:   'recommend',
    FREE_CHAT:   'free_chat',
};

// In-memory session store (keyed by userId or sessionId)
const sessions = new Map();

const getSession = (sessionId) => {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            state: CONVERSATION_STATES.GREETING,
            answers: {},
            history: [],
        });
    }
    return sessions.get(sessionId);
};

// ── Cosine Similarity ───────────────────────────────────────────────
const cosineSimilarity = (vecA, vecB) => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot  += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// ── Convert Answers to Preference Vector ────────────────────────────
const answersToVector = (answers) => {
    const strengthMap = { light: 3, medium: 5, strong: 8, 'very strong': 10 };
    const sweetMap    = { 'not sweet': 2, 'slightly sweet': 4, sweet: 7, 'very sweet': 9 };
    const flavorMap   = {
        chocolate:  { bitterness: 5, acidity: 3, roast: 6, body: 7, sweetness: 6 },
        fruity:     { bitterness: 3, acidity: 7, roast: 4, body: 4, sweetness: 5 },
        nutty:      { bitterness: 5, acidity: 4, roast: 6, body: 6, sweetness: 4 },
        spicy:      { bitterness: 7, acidity: 3, roast: 7, body: 8, sweetness: 2 },
        floral:     { bitterness: 3, acidity: 6, roast: 3, body: 3, sweetness: 5 },
        caramel:    { bitterness: 3, acidity: 3, roast: 5, body: 5, sweetness: 8 },
        classic:    { bitterness: 5, acidity: 5, roast: 5, body: 5, sweetness: 5 },
    };
    const timeMap = {
        morning:   { bitterness: 7, acidity: 5, roast: 7, body: 7, sweetness: 3 },
        afternoon: { bitterness: 5, acidity: 4, roast: 5, body: 5, sweetness: 5 },
        evening:   { bitterness: 3, acidity: 3, roast: 4, body: 4, sweetness: 6 },
        anytime:   { bitterness: 5, acidity: 5, roast: 5, body: 5, sweetness: 5 },
    };

    const strength = strengthMap[answers.strength] || 5;
    const sweet    = sweetMap[answers.sweetness] || 5;
    const flavor   = flavorMap[answers.flavor] || flavorMap.classic;
    const time     = timeMap[answers.time] || timeMap.anytime;

    return [
        (strength * 0.4 + flavor.bitterness * 0.3 + time.bitterness * 0.3),
        (flavor.acidity * 0.5 + time.acidity * 0.5),
        (strength * 0.3 + flavor.roast * 0.4 + time.roast * 0.3),
        (flavor.body * 0.5 + time.body * 0.5),
        (sweet * 0.5 + flavor.sweetness * 0.3 + time.sweetness * 0.2),
    ];
};

// ── Process Message ─────────────────────────────────────────────────
const processMessage = async (sessionId, userMessage) => {
    const session = getSession(sessionId);
    const msg = userMessage.toLowerCase().trim();

    session.history.push({ role: 'user', text: userMessage });

    let response = {};

    switch (session.state) {
        case CONVERSATION_STATES.GREETING:
            response = {
                text: "☕ Welcome to your AI Coffee Assistant! I'll help you find the perfect coffee.\n\nLet's start — How do you like your coffee strength?",
                quickReplies: ['Light', 'Medium', 'Strong', 'Very Strong'],
            };
            session.state = CONVERSATION_STATES.ASK_STRENGTH;
            break;

        case CONVERSATION_STATES.ASK_STRENGTH:
            session.answers.strength = msg;
            response = {
                text: 'Great choice! Now, how sweet do you prefer your coffee?',
                quickReplies: ['Not Sweet', 'Slightly Sweet', 'Sweet', 'Very Sweet'],
            };
            session.state = CONVERSATION_STATES.ASK_SWEET;
            break;

        case CONVERSATION_STATES.ASK_SWEET:
            session.answers.sweetness = msg;
            response = {
                text: 'Interesting! What flavor notes do you enjoy most?',
                quickReplies: ['Chocolate', 'Fruity', 'Nutty', 'Spicy', 'Floral', 'Caramel', 'Classic'],
            };
            session.state = CONVERSATION_STATES.ASK_FLAVOR;
            break;

        case CONVERSATION_STATES.ASK_FLAVOR:
            session.answers.flavor = msg;
            response = {
                text: 'Last question — When do you usually enjoy your coffee?',
                quickReplies: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
            };
            session.state = CONVERSATION_STATES.ASK_TIME;
            break;

        case CONVERSATION_STATES.ASK_TIME: {
            session.answers.time = msg;

            // Calculate recommendations
            const products = await Product.find({});
            const userVector = answersToVector(session.answers);

            const scored = products.map(p => {
                const productVector = [
                    p.coffeeDNA.bitterness,
                    p.coffeeDNA.acidity,
                    p.coffeeDNA.roastLevel,
                    p.coffeeDNA.body,
                    p.coffeeDNA.sweetness,
                ];
                const similarity = cosineSimilarity(userVector, productVector);
                return { product: p, similarity };
            });

            scored.sort((a, b) => b.similarity - a.similarity);
            const top3 = scored.slice(0, 3);

            const recommendationText = top3.map((item, i) => {
                const p = item.product;
                const pct = (item.similarity * 100).toFixed(0);
                const brew = p.brewingMethods?.length ? `\n   Brewing: ${p.brewingMethods.join(', ')}` : '';
                return `${i + 1}. **${p.name}** (${pct}% match) — $${p.price}${brew}`;
            }).join('\n\n');

            response = {
                text: `🎯 Based on your preferences, here are my top picks:\n\n${recommendationText}\n\nWould you like to know more about any of these, or start over?`,
                quickReplies: ['Tell me more', 'Start over', 'Thanks!'],
                recommendations: top3.map(item => ({
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    similarity: Math.round(item.similarity * 100),
                })),
            };
            session.state = CONVERSATION_STATES.FREE_CHAT;
            break;
        }

        case CONVERSATION_STATES.FREE_CHAT:
            if (msg.includes('start over') || msg.includes('restart')) {
                session.state = CONVERSATION_STATES.GREETING;
                session.answers = {};
                return processMessage(sessionId, 'hi');
            }
            response = {
                text: "I'm glad I could help! Feel free to start a new conversation anytime. Would you like to take our Coffee Quiz for a more detailed profile? 🧪",
                quickReplies: ['Start over', 'Take the Quiz'],
            };
            break;

        default:
            session.state = CONVERSATION_STATES.GREETING;
            return processMessage(sessionId, userMessage);
    }

    session.history.push({ role: 'assistant', text: response.text });

    return {
        ...response,
        sessionState: session.state,
    };
};

// ── Reset Session ───────────────────────────────────────────────────
const resetSession = (sessionId) => {
    sessions.delete(sessionId);
};

module.exports = { processMessage, resetSession, cosineSimilarity };
