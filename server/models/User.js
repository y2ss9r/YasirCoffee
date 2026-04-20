const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,   // always stored as lowercase — prevents duplicate accounts
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,     // never returned in queries unless explicitly requested
    },
    isAdmin: { type: Boolean, required: true, default: false },

    // === AI Coffee DNA / Taste Profile ===
    tasteProfile: {
        bitterness:  { type: Number, default: 5, min: 0, max: 10 },
        acidity:     { type: Number, default: 5, min: 0, max: 10 },
        roastLevel:  { type: Number, default: 5, min: 0, max: 10 },
        body:        { type: Number, default: 5, min: 0, max: 10 },
        sweetness:   { type: Number, default: 5, min: 0, max: 10 },
    },

    // === AI Activity Tracking ===
    quizCompleted: { type: Boolean, default: false },
    lastActive:    { type: Date, default: Date.now },
    purchaseCount: { type: Number, default: 0 },

    // === Taste Evolution History ===
    tasteHistory: [{
        date: { type: Date, default: Date.now },
        profile: {
            bitterness:  Number,
            acidity:     Number,
            roastLevel:  Number,
            body:        Number,
            sweetness:   Number,
        },
        trigger: { type: String, enum: ['quiz', 'purchase', 'rating', 'manual'] },
    }],
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    // Cost factor 12 = strong hashing (~300ms on modern hardware — good balance)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
