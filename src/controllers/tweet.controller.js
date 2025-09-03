import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!content || content.trim() === "")
    throw new ApiError(400, "Tweet content is required");

  const newTweet = new Tweet({
    content: content.trim(),
    owner: req.user._id,
  });

  await newTweet.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, { tweet: newTweet }, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

  const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "name username avatar") // adjust fields as needed
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweets, count: tweets.length },
        "User tweets fetched successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");
  if (!tweet.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your tweet");

  if (content && content.trim() !== "") {
  const trimmedContent = content.trim();
  if (trimmedContent.length > 280) throw new ApiError(400, "Tweet too long");
  tweet.content = trimmedContent;
}


  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");
  if (!tweet.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your tweet");

  await tweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
