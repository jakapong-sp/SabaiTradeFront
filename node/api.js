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
const path_uploaded = 'C:/node/uploaded/images/';
const mongo = require('mongodb');
// const path_uploaded = path.resolve('node/uploaded/images/');

const nodemailer = require('nodemailer');
const mailSender = 'jakapong.sp@gmail.com';
const urlMain = "http://203.151.27.223:90";
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jakapong.sp@gmail.com', // your email
    pass: 'golflogin@ja' // your email password
  }
});

function refnumber(num, len) {
  return (Array(len).join('0') + num).slice(-len);
}

router.get('/order', function(req, res) {
  mongoClient.connect(mongo_string, function(err, client) {
    if (err) throw err;
    var db = client.db(mongo_db_name);
    db
      .collection('Orders')
      .find()
      .toArray(function(findErr, result) {
        if (findErr) throw findErr;
        console.log(result);
        res.json(result);
        client.close();
      });
  });
});

router.get('/asset/id/:id', function(req, res) {
  mongoClient.connect(mongo_string, function(err, client) {
    if (err) throw err;
    console.log("history member ref:" + req.params.id);
    var db = client.db(mongo_db_name);
    db
      .collection('Assets')
      .find({
        // Active: true,
        // Approve2By: { $ne: null }
        $and: [
          { Active: true },
          { MemberRef: req.params.id},
          {
            $or: [
              {
                $and: [{ AssetType: 'Deposit' }, { Approve2By: { $ne: null } }]
              },
              {
                $and: [
                  { AssetType: 'Withdraw' },
                  { Status: { $ne: 'DisApprove' } }
                ]
              }
            ]
          }
        ]
      })
      .toArray(function(findErr, result) {
        if (findErr) throw findErr;
        console.log(result);
        res.json(result);
        client.close();
      });
  });
});

router.post('/asset', function(req, res) {
  mongoClient.connect(mongo_string, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mongo_db_name);
    console.log(req.body);
    autoIncrement.getNextSequence(dbo, 'Assets', function(err, autoIndex) {
      req.body.AssetRef = 'DP' + refnumber(autoIndex, 5);
      req.body.MemberRef = req.body.MemberRef;
      req.body.AssetType = req.body.AssetType;
      req.body.Amount = 0;
      req.body.AmountRequest = parseFloat(req.body.AmountRequest);
      req.body.Status = null;
      req.body.Approve1Date = null;
      req.body.Approve1By = null;
      req.body.Approve2Date = null;
      req.body.Approve2By = null;
      req.body.Active = true;
      req.body.CreateDate = new Date();
      req.body.CreateBy = req.body.CreateBy;
      dbo.collection('Assets').insertOne(req.body, function(err, result) {
        if (err) throw err;
        console.log('1 document inserted (Assets Deposit)');
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

router.get('/productAsset/', function(req, res) {
  mongoClient.connect(mongo_string, function(err, client) {
    if (err) throw err;
    var db = client.db(mongo_db_name);
    db
      .collection('Orders')
      .aggregate([
        {
          $lookup: {
            from: 'Assets',
            localField: 'MemberRef',
            foreignField: 'MemberRef',
            as: 'Asssets'
          }
        },
        { $sort: { CreateDate: 1 } }
      ])
      .toArray(function(findErr, result) {
        if (findErr) throw findErr;
        res.json(result);
        client.close();
      });
  });
});

router.post('/fileUpload/', function(req, res) {
  console.log('Upload File');
  try {
    var form = new formidable.IncomingForm();
    var newname = Date.now();
    form.parse(req, function(err, fields, files) {
      var oldpath = files.filetoupload.path;

      // var newpath = path.resolve('node/uploaded/images/') + '/' + newname + '.' + files.filetoupload.name.split('.')[1];
      var newpath = path_uploaded + newname + '.' + files.filetoupload.name.split('.')[1];
      console.log('old path ' + oldpath);
      console.log('new path ' + newpath);
      
      
      fs.rename(oldpath, newpath, function(err) {
        if (err) throw err;
        res.statusMessage = newname + '.' + files.filetoupload.name.split('.')[1];;
        res.write(
          '[{"success":1,"messege":"File uploaded and moved!","name":"' + newname + '.' + files.filetoupload.name.split('.')[1] + '"}]'
        );
        console.log('success uploaded');
        res.end();
      });
    });
  } catch (err) {
    console.log('err : ' + err);
  }
});

// Members


router.post('/member', function(req, res) {
  console.log(req.body);
  mongoClient.connect(mongo_string, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mongo_db_name);
    console.log(req.body);
    autoIncrement.getNextSequence(dbo, 'Members', function(err, autoIndex) {
      req.body.MemberRef = mongo.ObjectID().toString(); // 'MB' + refnumber(autoIndex, 5);
      req.body.FirstName = req.body.FirstName;
      req.body.LastName = req.body.LastName;
      req.body.MemberName = null;
      req.body.Address = req.body.Address;
      req.body.Email = req.body.Email;
      req.body.Telephone = req.body.Telephone;
      req.body.Password = req.body.Password;
      req.body.Status = null;
      req.body.Verify = false;
      req.body.Approve1Date = null;
      req.body.Approve1By = null;
      req.body.Approve2Date = null;
      req.body.Approve2By = null;
      req.body.Active = true;
      req.body.CreateDate = new Date();
      req.body.CreateBy = null;
      dbo.collection('Members').insertOne(req.body, function(err, result) {
        if (err) throw err;
        // Send Email
        let mailSubject = 'Sabai Plus Admin';
        const urlBody = urlMain + "/pages/register-verify?regKey=" + req.body.MemberRef;
        const mailBody = "Hello,<br/>Follow this link to verify your email address.<br/>" + urlBody + "<br/>If you didn’t ask to verify this address, you can ignore this email.<br/>Thanks,<br/>Sabai Broker team";
        const mailOptions = {
          from: mailSender, // sender
          to: req.body.Email, // list of receivers
          subject: mailSubject, // Mail subject
          html: mailBody // HTML body
        };
        transporter.sendMail(mailOptions, function(error, response) {
          transporter.close();
          if (error) {
            console.log(error);
          } else {
            console.log(
              'Send Email Register Member Success (MemberRef : ' + res.body.MemberRef + ')'
            );
          }
        });

        console.log('1 document inserted (Register Member and Send Email)');
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
