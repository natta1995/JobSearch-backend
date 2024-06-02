const express = require('express');
const db = require('./db');
const app = express();
const port = 3000;

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
