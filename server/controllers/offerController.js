const asyncHandler = require('express-async-handler');
const { getUserOffers, useOffer, generateCrossSellOffers } = require('../services/offerService');

// @desc    Get active offers for authenticated user
// @route   GET /api/offers
// @access  Private
const getOffers = asyncHandler(async (req, res) => {
    const offers = await getUserOffers(req.user._id);
    res.json({ offers });
});

// @desc    Use/redeem an offer
// @route   POST /api/offers/use/:id
// @access  Private
const redeem = asyncHandler(async (req, res) => {
    const offer = await useOffer(req.params.id, req.user._id);

    if (!offer) {
        res.status(404);
        throw new Error('Offer not found or already used');
    }

    res.json({ message: 'Offer redeemed successfully', offer });
});

// @desc    Generate cross-sell offers for user
// @route   POST /api/offers/generate
// @access  Private
const generate = asyncHandler(async (req, res) => {
    const offers = await generateCrossSellOffers(req.user._id);
    res.json({ offers, count: offers.length });
});

module.exports = { getOffers, redeem, generate };
