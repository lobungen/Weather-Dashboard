import express from 'express';
import path from 'path';
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (like CSS, JS, images, etc.)
app.use(express.static('server'));

// Catch-all route that sends index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'server', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
