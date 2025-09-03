import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

// Get all videos with pagination, search, sort
const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  const sortOrder = sortType === "asc" ? 1 : -1;
  const videos = await Video.find(filter)
    .populate("owner", "name username avatar")
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Video.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, total, page, totalPages: Math.ceil(total / limit) },
        "Videos fetched successfully"
      )
    );
});

// Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!title || title.trim() === "")
    throw new ApiError(400, "Title is required");
  if (!req.files || !req.files.video || !req.files.thumbnail)
    throw new ApiError(400, "Video file and thumbnail are required");

  // Upload video and thumbnail to Cloudinary
  const uploadedVideo = await uploadOnCloudinary(
    req.files.video[0].path,
    "video"
  );
  const uploadedThumbnail = await uploadOnCloudinary(
    req.files.thumbnail[0].path,
    "image"
  );

  const newVideo = new Video({
    title: title.trim(),
    description: description ? description.trim() : "",
    owner: req.user._id,
    videoFile: uploadedVideo.secure_url,
    videoPublicId: uploadedVideo.public_id,
    thumbnail: uploadedThumbnail.secure_url,
    thumbnailPublicId: uploadedThumbnail.public_id,
    duration: uploadedVideo.duration || 0,
    isPublished: true,
  });

  await newVideo.save();

  return res
    .status(201)
    .json(
      new ApiResponse(201, { video: newVideo }, "Video published successfully")
    );
});

// Get video by ID (increment views)
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId).populate(
    "owner",
    "name username avatar"
  );
  if (!video) throw new ApiError(404, "Video not found");

  // Increment views
  video.views += 1;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video fetched successfully"));
});

// Update video
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your video");

  if (title && title.trim() !== "") video.title = title.trim();
  if (description && description.trim() !== "")
    video.description = description.trim();

  // Handle file updates
  if (req.files) {
    if (req.files.video) {
      // Delete old video from Cloudinary
      if (video.videoPublicId) await deleteFromCloudinary(video.videoPublicId);
      const uploadedVideo = await uploadOnCloudinary(
        req.files.video[0].path,
        "video"
      );
      video.videoFile = uploadedVideo.secure_url;
      video.videoPublicId = uploadedVideo.public_id;
      video.duration = uploadedVideo.duration || video.duration;
    }
    if (req.files.thumbnail) {
      if (video.thumbnailPublicId)
        await deleteFromCloudinary(video.thumbnailPublicId);
      const uploadedThumbnail = await uploadOnCloudinary(
        req.files.thumbnail[0].path,
        "image"
      );
      video.thumbnail = uploadedThumbnail.secure_url;
      video.thumbnailPublicId = uploadedThumbnail.public_id;
    }
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video updated successfully"));
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your video");

  // Delete video and thumbnail from Cloudinary
  if (video.videoPublicId) await deleteFromCloudinary(video.videoPublicId);
  if (video.thumbnailPublicId)
    await deleteFromCloudinary(video.thumbnailPublicId);

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

// Toggle publish/unpublish
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (!video.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your video");

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video },
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
