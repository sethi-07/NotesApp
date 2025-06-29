const express = require("express");
const path = require("path");
const app = express();
const Note = require("./config"); // Assuming config.js exports the Note model

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // FIXED

app.get("/", async (req, res) => {
  try {
    const notes = await Note.find();
    res.render("notes", { notes: notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).send("Error fetching notes");
  }
});

app.get("/addNote", (req, res) => { // ADDED
  res.render("addNote");
});

app.post("/addNote", (req, res) => {
  const data = {
    title: req.body.title,
    content: req.body.content
  };
  const newNote = new Note(data);
  newNote.save()
    .then(() => {
      console.log("Note created successfully:", newNote);
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Error creating note:", error);
      res.status(500).send("Error creating note");
    });
});

app.get("/editNote/:id", (req, res) => {
  const noteId = req.params.id;
  Note.findById(noteId)
    .then((note) => {
      if (!note) {
        return res.status(404).send("Note not found");
      }
      res.render("editNote", { note: note });
    })
    .catch((error) => {
      console.error("Error fetching note:", error);
      res.status(500).send("Error fetching note");
    });
});

app.post("/editNote/:id", (req, res) => {
  const noteId = req.params.id;
  const updatedData = {
    title: req.body.title,
    content: req.body.content
  };
  Note.findByIdAndUpdate(noteId, updatedData, { new: true })
    .then((updatedNote) => {
      if (!updatedNote) {
        return res.status(404).send("Note not found");
      }
      console.log("Note updated successfully:", updatedNote);
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Error updating note:", error);
      res.status(500).send("Error updating note");
    });
});

app.post("/deleteNote/:id", (req, res) => {
  const noteId = req.params.id; // FIXED
  Note.findByIdAndDelete(noteId)
    .then(() => {
      console.log("Note deleted successfully");
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Error deleting note:", error);
      res.status(500).send("Error deleting note"); // ADDED
    });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

