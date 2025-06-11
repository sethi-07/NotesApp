const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb://localhost:27017/notesApp');

connect.then(() => {
  console.log('Connected to MongoDB');
}).catch(() => {
  console.error('Failed to connect to MongoDB');
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3
  },
  password: {
    type: String,
    required: true,
    minLength: 4
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
);

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 1
  },
  content: {
    type: String,
    required: true,
    minLength: 1
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const collection = {
  User: mongoose.model('User', userSchema),
  Note: mongoose.model('Note', noteSchema)
}

module.exports = collection;