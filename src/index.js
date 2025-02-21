const express = require('express');
const path = require('path');
const { parseRota } = require('./utils/rotaParser');
const repo = require('./db/shiftRepository'); // already an instance
const generateICS = require('./utils/calendarGenerator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('rota'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }
      const shifts = await parseRota(req.file.path);
      await repo.saveShifts(shifts);
      res.send('Rota processed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).send('Error processing rota');
    }
  });
  

app.get('/shifts', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) {
      return res.status(400).send('Name parameter is required');
    }
    const shifts = await repo.getShiftsByName(name);
    res.json(shifts);
  } catch (error) {
    console.error('Shifts error:', error);
    res.status(500).send('Error retrieving shifts');
  }
});

app.get('/download/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const shifts = await repo.getShiftsByName(name);
    const icsContent = generateICS(shifts);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename=${name}_shifts.ics`);
    res.send(icsContent);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error generating calendar');
  }
});

// Initialize the database before starting the server
repo.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });
