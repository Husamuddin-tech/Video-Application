import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    // Example: check if essential ENV variable is missing
    if (!process.env.MONGO_URL) {
      throw new ApiError(500, "Missing MongoDB connection string");
    }

    // If everything is fine
    return res
      .status(200)
      .json(new ApiResponse(200, { status: "OK" }, "Server is healthy 🚀"));
  } catch (error) {
    // Send ApiError response if something goes wrong
    throw new ApiError(500, error.message || "Healthcheck failed ❌");
  }
});

export { healthcheck };
