import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (existingLike) {
    // Unlike the video
    await Like.findByIdAndDelete(existingLike._id);
    const likeCount = await Like.countDocuments({ video: videoId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likeCount },
          "Video unliked successfully"
        )
      );
  } else {
    // Like the video
    try {
      const newLike = new Like({ video: videoId, likedBy: req.user._id });
      await newLike.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, "Already liked");
      }
      throw error;
    }
    const likeCount = await Like.countDocuments({ video: videoId });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { liked: true, likeCount },
          "Video liked successfully"
        )
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (existingLike) {
    // Unlike the comment
    await Like.findByIdAndDelete(existingLike._id);
    const likeCount = await Like.countDocuments({ comment: commentId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likeCount },
          "Comment unliked successfully"
        )
      );
  } else {
    // Like the comment
    try {
      const newLike = new Like({ comment: commentId, likedBy: req.user._id });
      await newLike.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, "Already liked");
      }
      throw error;
    }
    const likeCount = await Like.countDocuments({ comment: commentId });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { liked: true, likeCount },
          "Comment liked successfully"
        )
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  if (existingLike) {
    // Unlike the tweet
    await Like.findByIdAndDelete(existingLike._id);
    const likeCount = await Like.countDocuments({ tweet: tweetId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likeCount },
          "Tweet unliked successfully"
        )
      );
  } else {
    // Like the tweet
    try {
      const newLike = new Like({ tweet: tweetId, likedBy: req.user._id });
      await newLike.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, "Already liked");
      }
      throw error;
    }
    const likeCount = await Like.countDocuments({ tweet: tweetId });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { liked: true, likeCount },
          "Tweet liked successfully"
        )
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null },
  })
    .populate("video", "title description views createdAt thumbnail owner")
    .lean();
  return res
    .status(200)
    .json(
      new ApiResponse(200, { likedVideos }, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
