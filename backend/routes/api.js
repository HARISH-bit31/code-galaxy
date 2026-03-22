const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Folder = require('../models/Folder');
const File = require('../models/File');
const User = require('../models/User');

// auth
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ success: true, user: { id: user._id.toString(), name: user.name, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// overview
router.get('/overview', (req, res) => {
  res.json({
    title: 'Code Galaxy Overview',
    description: 'Welcome to the CSE Lab Code Repository system. This platform allows students to view and interact with lab code across various subjects.',
    features: [
      'Navigate through subjects like C, C++, Java, DS, DBMS, and FST.',
      'Explore neatly organized folders and repository files.',
      'React App (Port 3000): Full access mode with copy and download privileges.',
      'Angular App (Port 4200): Restricted lab mode with copy/paste, right-click, and download blocked.'
    ]
  });
});

// subjects
router.get('/subjects', async (req, res) => {
  try {
    const { userId } = req.query;
    const subjects = await Subject.find(userId ? { userId } : {});
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// folders
router.get('/folders/:parentId', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = { parentId: req.params.parentId };
    if (userId) query.userId = userId;
    const folders = await Folder.find(query);
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/folders', async (req, res) => {
  try {
    const { name, parentId, userId } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // check FST depth limit (max 2 levels)
    let currentId = parentId;
    let depth = 0;
    while (currentId) {
      const parentFolder = await Folder.findById(currentId);
      if (parentFolder) {
        depth++;
        currentId = parentFolder.parentId;
      } else {
        break;
      }
    }
    if (depth >= 2) {
      let rootParentId = parentId;
      let tempFolder = await Folder.findById(rootParentId);
      while (tempFolder) {
        rootParentId = tempFolder.parentId;
        tempFolder = await Folder.findById(rootParentId);
      }
      const subject = await Subject.findById(rootParentId);
      if (subject && subject.name === 'FST') {
        return res.status(400).json({ error: 'FST only allows 2 levels of folders.' });
      }
    }

    const folder = new Folder({ name, parentId, userId });
    await folder.save();
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// folder depth
router.get('/folder-depth/:folderId', async (req, res) => {
  try {
    let currentId = req.params.folderId;
    let depth = 0;
    while (currentId) {
      const folder = await Folder.findById(currentId);
      if (folder) {
        depth++;
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    res.json({ depth });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/folders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Folder.findByIdAndDelete(id);
    await File.deleteMany({ folderId: id });
    const subFolders = await Folder.find({ parentId: id });
    for (const sub of subFolders) {
      await File.deleteMany({ folderId: sub._id.toString() });
      await Folder.findByIdAndDelete(sub._id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// files
router.get('/files/:folderId', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = { folderId: req.params.folderId };
    if (userId) query.userId = userId;
    const files = await File.find(query);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subject-files/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { userId } = req.query;
    const folderQuery = { parentId: subjectId };
    if (userId) folderQuery.userId = userId;
    const folders = await Folder.find(folderQuery);
    const folderIds = folders.map(f => f._id.toString());
    // include nested folders (FST)
    const subFolders = await Folder.find({ parentId: { $in: folderIds } });
    const allFolderIds = [...folderIds, ...subFolders.map(f => f._id.toString())];
    const fileQuery = { folderId: { $in: allFolderIds } };
    if (userId) fileQuery.userId = userId;
    const files = await File.find(fileQuery);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/files', async (req, res) => {
  try {
    const { name, folderId, userId } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const file = new File({ name, content: '// New file content', folderId, userId });
    await file.save();
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/files/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const file = await File.findByIdAndUpdate(id, { content }, { new: true });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/files/:id', async (req, res) => {
  try {
    await File.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/files/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    if (action === 'favorite') file.isFavorite = !file.isFavorite;
    if (action === 'important') file.isImportant = !file.isImportant;
    await file.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// download
router.get('/download/:id', async (req, res) => {
  try {
    const origin = req.get('origin') || req.get('referer') || '';
    if (origin.includes('4200')) {
      return res.status(403).json({ error: 'Downloads are disabled in Lab Mode.' });
    }
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send('File not found');

    res.setHeader('Content-disposition', `attachment; filename=${file.name}`);
    res.setHeader('Content-type', 'text/plain');
    res.send(file.content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// search
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    const { userId } = req.query;
    if (!q) return res.json({ subjects: [], folders: [], files: [] });

    const regex = new RegExp(q, 'i');
    const userFilter = userId ? { userId } : {};

    const [subjects, folders, files] = await Promise.all([
      Subject.find({ $or: [{ name: regex }, { description: regex }], ...userFilter }),
      Folder.find({ name: regex, ...userFilter }),
      File.find({ $or: [{ name: regex }, { content: regex }], ...userFilter })
    ]);

    res.json({ subjects, folders, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
