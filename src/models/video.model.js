const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    videoPublicId: { type: String },
    thumbnail: { type: String, required: true },
    thumbnailPublicId: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    duration: { type: Number, required: true, default: 0 },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.index({ title: "text", description: "text" });

export const Video = mongoose.model("Video", videoSchema);
