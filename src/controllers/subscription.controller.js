import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!req.user) {
        throw new ApiError(401, "Unauthorized")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (existingSubscription) {
        // Unsubscribe
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"))
    } else {
        // Subscribe
        const newSubscription = new Subscription({
            subscriber: req.user._id,
            channel: channelId
        })
        await newSubscription.save()
        return res.status(201).json(new ApiResponse(201, null, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "name email avatar") // adjust fields as needed
    .lean();

    const count = subscribers.length;

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribers, count }, "Subscribers fetched successfully"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber ID");

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "name email avatar") // adjust fields as needed
    .lean();

    // Return only the channel info
  const channels = subscriptions.map(sub => sub.channel);


  return res
    .status(200)
    .json(new ApiResponse(200, { channels, count: channels.length }, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}