import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
    },

  },
  {
    timestamps: true,
  }
);


likeSchema.pre("save", function (next) {
  const refs = [this.video, this.comment, this.tweet].filter(Boolean);
  if (refs.length !== 1) {
    return next(new Error("A like must belong to exactly one entity (video, comment, or tweet)."));
  }
  next();
});


// Prevent duplicate likes
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true });

export const Like = mongoose.model("Like", likeSchema)