const Mongoose = require("mongoose");
const Country = new Mongoose.Schema({
  _id: {
    type: Object,
    // required: [true, "Please enter User name"],
  }
});

module.exports =  Mongoose.model("countries", Country);