const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const session = require('express-session');
const mongoClient = require('mongodb').MongoClient;
const autoIncrement = require('mongodb-autoincrement');
const formidable = require('formidable');
const mongo_string = 'mongodb://localhost:27017';
const mongo_db_name = 'SBB';

function refnumber(num, len) {
  return (Array(len).join('0') + num).slice(-len);
}


router.post('/member', function(req, res) {
  console.log(req.body);
  return req.body;
  mongoClient.connect(mongo_string, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mongo_db_name);
    console.log(req.body);
    autoIncrement.getNextSequence(dbo, 'Members', function(err, autoIndex) {
      req.body.MemberRef = 'MB' + refnumber(autoIndex, 5);
      req.body.FirstName = req.body.FirstName;
      req.body.LastName = req.body.LastName;
      req.body.Address = req.body.Address;
      req.body.Email = req.body.Email;
      req.body.Telephone = req.body.Telephone;
      req.body.Password = req.body.Password;

      req.body.Approve1Date = null;
      req.body.Approve1By = null;
      req.body.Approve2Date = null;
      req.body.Approve2By = null;
      req.body.Active = true;
      req.body.CreateDate = new Date();
      req.body.CreateBy = req.body.CreateBy;
      dbo.collection('Members').insertOne(req.body, function(err, result) {
        if (err) throw err;
        console.log('1 document inserted (Register Member)');
        const response = {
          result: 'ok',
          message: result.result.n + ' Updated'
        };
        res.json(response);
        console.log(req.body);
        db.close();
      });
    });
  });
});



module.exports = router;
