// import { Router } from 'express';
// import {
//     deleteVideo,
//     getAllVideos,
//     getVideoById,
//     publishAVideo,
//     togglePublishStatus,
//     updateVideo,
// } from "../controllers/video.controller.js"
// import {verifyJWT} from "../middlewares/auth.middleware.js"
// import {upload} from "../middlewares/multer.middleware.js"

// const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router
//     .route("/")
//     .get(getAllVideos)
//     .post(
//         upload.fields([
//             {
//                 name: "videoFile",
//                 maxCount: 1,
//             },
//             {
//                 name: "thumbnail",
//                 maxCount: 1,
//             },
            
//         ]),
//         publishAVideo
//     );

// router
//     .route("/:videoId")
//     .get(getVideoById)
//     .delete(deleteVideo)
//     .patch(upload.single("thumbnail"), updateVideo);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

// export default router

import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// GET all videos and POST a new video
router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "video", maxCount: 1 },      // Must match controller field
      { name: "thumbnail", maxCount: 1 },  // Must match controller field
    ]),
    publishAVideo
  );

// GET, DELETE, PATCH a single video by ID
router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(
    upload.fields([
      { name: "video", maxCount: 1 },      // Optional update for video
      { name: "thumbnail", maxCount: 1 },  // Optional update for thumbnail
    ]),
    updateVideo
  );

// Toggle publish/unpublish
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
