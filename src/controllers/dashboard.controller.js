import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const stats = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $group: {
        _id: "$owner",
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", // owner = channelId
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: { $size: "$subscribers" },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  const result = stats[0] || {
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalSubscribers: 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videosAgg = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(channelId) },
    },
    // Join with likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    // Join with comments
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
      },
    },
    {
      $sort: { createdAt: -1 }, // latest videos first
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          {
            $addFields: {
              page: pageNum,
              limit: limitNum,
              totalPages: {
                $ceil: { $divide: ["$total", limitNum] },
              },
              hasNextPage: {
                $gt: [{ $subtract: ["$total", pageNum * limitNum] }, 0],
              },
            },
          },
        ],
        data: [
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              views: 1,
              createdAt: 1,
              likesCount: 1,
              commentCount: 1,
            },
          },
        ],
      },
    },
  ]);

  const result = videosAgg[0] || { metadata: [], data: [] };
  const metadata = result.metadata[0] || {
    total: 0,
    page: pageNum,
    limit: limitNum,
    totalPages: 0,
    hasNextPage: false,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: result.data,
        ...metadata,
      },
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
