const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, default: '' },
  folderId: { type: String, required: true },
  userId: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('File', fileSchema);
