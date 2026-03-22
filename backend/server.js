const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// routes
app.use('/api', apiRoutes);

// start server FIRST
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// then connect DB
connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));