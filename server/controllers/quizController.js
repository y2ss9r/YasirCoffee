const asyncHandler = require('express-async-handler');
const { QUIZ_QUESTIONS, calculateQuizResults } = require('../services/quizService');
const { initializeFromQuiz } = require('../services/tasteProfileService');

// @desc    Get quiz questions
// @route   GET /api/quiz/questions
// @access  Public
const getQuestions = asyncHandler(async (req, res) => {
    res.json({ questions: QUIZ_QUESTIONS });
});

// @desc    Submit quiz answers and get results
// @route   POST /api/quiz/submit
// @access  Public (if userId provided, saves to profile)
const submitQuiz = asyncHandler(async (req, res) => {
    const { answers, userId } = req.body;

    if (!answers || !Array.isArray(answers)) {
        res.status(400);
        throw new Error('Answers array is required');
    }

    const results = await calculateQuizResults(answers);

    // If user is logged in, save to their profile
    if (userId || req.user?._id) {
        const uid = userId || req.user._id;
        await initializeFromQuiz(uid, results.profile);
    }

    res.json(results);
});

module.exports = { getQuestions, submitQuiz };
