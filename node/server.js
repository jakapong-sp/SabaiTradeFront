const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const cors = require('cors')

// Allow client to access cross domain or ip-address
app.use(function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); // if use upload image must fix url ให้รู้จักก่อน
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false })); //for postmanform
  app.use('/api', require('./api'));// import module
  
  
  // app.use(express.static(path.join(__dirname, './uploaded_files')));
  app.use(express.static(path.join(__dirname, './uploaded')));
  app.use(express.static(path.join(__dirname, './../dist')));
  
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './../dist/index.html'));
  });
  
  var server = app.listen('3000', () => {
    console.log("Server is running");
  
  })
  
  