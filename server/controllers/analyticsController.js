const asyncHandler = require('express-async-handler');
const { getDashboardData, getDemandForecast } = require('../services/analyticsService');
const { detectStagnation } = require('../services/stagnationService');
const { getPricingSuggestions, applyDynamicPrices } = require('../services/pricingService');

// @desc    Get full admin AI dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboard = asyncHandler(async (req, res) => {
    const data = await getDashboardData();
    res.json(data);
});

// @desc    Get stagnation report
// @route   GET /api/analytics/stagnation
// @access  Private/Admin
const getStagnation = asyncHandler(async (req, res) => {
    const report = await detectStagnation();
    res.json(report);
});

// @desc    Get pricing suggestions
// @route   GET /api/analytics/pricing
// @access  Private/Admin
const getPricing = asyncHandler(async (req, res) => {
    const pricing = await getPricingSuggestions();
    res.json(pricing);
});

// @desc    Apply dynamic pricing
// @route   POST /api/analytics/pricing/apply
// @access  Private/Admin
const applyPricing = asyncHandler(async (req, res) => {
    const results = await applyDynamicPrices();
    res.json({ message: 'Dynamic prices applied', results });
});

// @desc    Get demand forecast for a product
// @route   GET /api/analytics/forecast/:productId
// @access  Private/Admin
const getForecast = asyncHandler(async (req, res) => {
    const forecast = await getDemandForecast(req.params.productId);
    res.json(forecast);
});

module.exports = { getDashboard, getStagnation, getPricing, applyPricing, getForecast };
