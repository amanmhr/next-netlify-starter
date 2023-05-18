const express = require('express');
const bodyParser = require('body-parser');
const NodeCouchDb = require('node-couchdb');
const path = require('path');

const app = express();
const couch = new NodeCouchDb({
  host: '127.0.0.1',
  protocol: 'http',
  port: 5984,
  auth: {
    user: 'admin', // Replace with your admin username
    pass: 'admin' // Replace with your admin password
  }
});
const dbName = 'mydb';

// Configure Express to use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle the form submission and render the second page
app.post('/page2', (req, res) => {
  const { name, age, sex } = req.body;
  res.sendFile(path.join(__dirname, 'public', 'page2.html'));
});

// Handle the form submission on the second page and redirect to the third page
app.post('/page3', (req, res) => {
  const { name, age, sex, weight, height } = req.body;

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // Create a new document with the submitted data and BMI
  const doc = {
    name,
    age: parseInt(age),
    sex,
    weight: parseFloat(weight),
    height: parseFloat(height),
    bmi: parseFloat(bmi.toFixed(2)),
    type: 'person'
  };

  // Insert the document into CouchDB
  couch.insert(dbName, doc)
    .then(({ data, headers, status }) => {
      console.log('Document saved:', data);
      // Redirect to the third page and pass the BMI data
      res.redirect(`/page3?name=${name}&age=${age}&sex=${sex}&weight=${weight}&height=${height}&bmi=${bmi}`);
    })
    .catch((err) => {
      console.error('Error storing data:', err);
      res.status(500).send('An error occurred.');
    });
});

// Serve the third page with the BMI data
app.get('/page3', (req, res) => {
  const { name, age, sex, weight, height, bmi } = req.query;
  res.render('page3', { name, age, sex, weight, height, bmi });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
