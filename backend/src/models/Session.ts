import mongoose from "mongoose";

const { Schema } = mongoose;

const SessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
      select: false, // زي passwordHash بالظبط، متبقاش راجعة في queries عادية
    },

    userAgent: {
      type: String,
      default: null,
    },

    ip: {
      type: String,
      default: null,
    },

    isValid: {
      type: Boolean,
      default: true, // بتتحول false وقت logout بدل ما تمسح الـ document
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: مونجو هيمسح الـ document نفسه أوتوماتيك لما expiresAt يجيله وقته
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", SessionSchema);

export default Session;