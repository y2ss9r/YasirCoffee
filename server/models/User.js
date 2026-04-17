const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
