import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Playlist name is required");
  }

  const newPlaylist = new Playlist({
    name: name.trim(),
    description: description ? description.trim() : "",
    owner: req.user._id,
    videos: [],
  });

  await newPlaylist.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { playlist: newPlaylist },
        "Playlist created successfully"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const playlists = await Playlist.find({ owner: userId }).populate("videos");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlists }, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  const playlist = await Playlist.findById(playlistId).populate("videos");
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your playlist");

  if (playlist.videos.some(v => v.equals(videoId))){
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Video already in playlist"));
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your playlist");

  playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your playlist");

  await playlist.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (!playlist.owner.equals(req.user._id))
    throw new ApiError(403, "Forbidden: Not your playlist");

  if (name && name.trim() !== "") playlist.name = name.trim();
  if (description && description.trim() !== "")
    playlist.description = description.trim();



  await playlist.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
