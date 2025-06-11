const express = require('express');
const path = require("path");
const bcrypt = require('bcrypt');
const session = require('express-session'); // Add this line
const collection = require('./config');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Add session middleware
app.use(session({
  secret: 'yourSecretKey', // Change this to a strong secret in production
  resave: false,
  saveUninitialized: false
}));

app.get('/signup', (req, res) => { res.render('signup') });
app.post('/signup', async (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };

  const existingUser = await collection.User.findOne({ username: data.username });
  if (existingUser) {
    return res.status(400).send('Username already exists');
  }

  const existingEmail = await collection.findOne({ email: data.email });
  if (existingEmail) {
    return res.status(400).send('Email already exists');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  data.password = hashedPassword;
  const newUser = await collection.insertMany(data);
  console.log('User created successfully:', newUser);
});


app.get('/login', (req, res) => { res.render('login') });
app.post('/login', async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password
    }

    const user = await collection.User.findOne({ username: userData.username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isPasswordValid = await bcrypt.compare(userData.password, user.password);
    if (isPasswordValid) {
      req.session.user = user; // Store user in session
      res.redirect('/notes');
    } else {
      res.send('Invalid password');
    }
  } catch {
    res.send('Wrong Details');
  }
});


app.get('/notes', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const notes = await collection.Note.find({ userId: req.session.user._id });
  res.render('notes', { user: req.session.user, notes: notes });
});



app.post('/notes', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const noteData = {
    title: req.body.title,
    content: req.body.content,
    userId: req.session.user._id // Use session user ID
  };

  try {
    const newNote = await collection.Note.create(noteData);
    console.log('Note created successfully:', newNote);
    res.redirect('/notes');
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).send('Error creating note');
  }
});

// Show form to add a new note
app.get('/notes/add', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('addNote', { user: req.session.user });
});

// Show form to edit a note
app.get('/notes/edit/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const note = await collection.Note.findOne({ _id: req.params.id, userId: req.session.user._id });
  if (!note) return res.status(404).send('Note not found');
  res.render('editNote', { user: req.session.user, note });
});

// Handle edit note form submission
app.post('/notes/edit/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  await collection.Note.updateOne(
    { _id: req.params.id, userId: req.session.user._id },
    { $set: { title: req.body.title, content: req.body.content } }
  );
  res.redirect('/notes');
});

// Handle delete note
app.post('/notes/delete/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  await collection.Note.deleteOne({ _id: req.params.id, userId: req.session.user._id });
  res.redirect('/notes');
});


const port = 9876;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Middleware to parse JSON bodies
