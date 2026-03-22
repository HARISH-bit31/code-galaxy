const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = 5000;

connectDB().then(() => {
  app.use('/api', apiRoutes);

  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
});
