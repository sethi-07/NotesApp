const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/notesApp");

connect.then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})

const Note = mongoose.model("notes", noteSchema);

module.exports = Note;