const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/digitalHealth");
mongoose.connect("mongodb+srv://neeraj:root@cluster0.tcym1gu.mongodb.net/digitalHealth?retryWrites=true&w=majority");

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

