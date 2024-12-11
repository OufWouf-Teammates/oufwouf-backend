const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");

async function upload(req, res, next) {
  if (!req.files?.photoFromFront) {
    console.log("je next lupload");
    next();
  }
  console.log("jai essaye lupload");

  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  console.log("jai essaye ");
  
  if (!resultMove) {
    console.log("j'ai chop dans tmp");
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    req.files.cloudinary_url = resultCloudinary.secure_url;
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    console.log("j'ai pas chop dans tmp");
    res.json({ result: false, error: resultMove });
  }

  next();
}

module.exports = { upload };
