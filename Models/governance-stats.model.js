const Mongoose = require("mongoose");
const GovernanceStats = new Mongoose.Schema({
  _id: {
    type: Object,
    // required: [true, "Please enter User name"],
  },
  score: {
    type: Object,
    // required: [true, "Please enter Email Address"],
  }
});

module.exports =  Mongoose.model("ndhs_master", GovernanceStats);