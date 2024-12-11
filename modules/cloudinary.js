const cloudinary = require("cloudinary").v2
const { log } = require("console")
const fs = require("fs")
const uniqid = require("uniqid")

async function upload(req, res, next) {
  if (!req.file?.photoFromFront) {
    next()
    console.log('je next lupload')
  }
  const photoPath = `../tmp/${uniqid()}.jpg`
  const resultMove = await req.files?.photoFromFront.mv(photoPath)
  const resultCloudinary = await cloudinary.uploader.upload(photoPath)
  fs.unlinkSync(photoPath)
  req.file.cloudinary_url = resultCloudinary.secure_url

  console.log('jai essaye lupload')

  next()
}

module.exports = { upload }
