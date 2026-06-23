const express = require('express');
const app = express();

app.get('/:id', (req, res) => {
  try {
    console.log('Original params:', req.params);
    req.params.id = 'modified';
    console.log('Modified params:', req.params);
    res.send('Success');
  } catch (e) {
    console.error('Error modifying params:', e.message);
    res.status(500).send(e.message);
  }
});

const server = app.listen(0, () => {
  const port = server.address().port;
  console.log(`Server listening on port ${port}`);

  const http = require('http');
  http.get(`http://localhost:${port}/123`, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      server.close();
    });
  });
});
