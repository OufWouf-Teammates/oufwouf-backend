require("dotenv").config()
require("./models/connection")

var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
const cors = require("cors")

const mongoose = require("mongoose")

const fileUpload = require("express-fileupload")
var indexRouter = require("./routes/index")
var usersRouter = require("./routes/users")
var dogsRouter = require("./routes/dogs")
var vaccinGenerauxRouter = require("./routes/vaccinGeneraux")
var vaccinsPersosRouter = require("./routes/vaccinsPersos")
var raceRouter = require("./routes/races")
var mapRouter = require("./routes/map")

var app = express()

app.use(cors())
app.use(fileUpload())
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use("/", indexRouter)
app.use("/users", usersRouter)
app.use("/dogs", dogsRouter)
app.use("/vaccinsGeneraux", vaccinGenerauxRouter)
app.use("/vaccinsPersos", vaccinsPersosRouter)
app.use("/races", raceRouter)
app.use("/map", mapRouter)

module.exports = app
