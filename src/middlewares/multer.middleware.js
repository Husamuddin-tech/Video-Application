// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     // cb(null, file.fieldname + '-' + uniqueSuffix)
//     // option 2
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({
//   storage,
// });


import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Keep original file name
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });

// For routes that expect both video and thumbnail
export const uploadVideoAndThumbnail = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
