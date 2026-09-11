import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'freelancer'
    },
    avatar: {
      type: String,
      default: null
    },
    profession: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other'
    },
    rating: {
      type: Number,
      default: 5.0
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      default: 45
    },
    location: {
      type: String,
      default: 'Remote'
    },
    googleId: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    razorpayAccountId: {
      type: String,
      default: null
    },
    razorpayOnboardingComplete: {
      type: Boolean,
      default: false
    },
    razorpayAccountStatus: {
      type: String,
      default: 'unregistered'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;