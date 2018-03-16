const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const session = require('express-session');

const mongoClient = require("mongodb").MongoClient;
const autoIncrement = require("mongodb-autoincrement");
const formidable = require('formidable');
const mongo_string = "mongodb://localhost:27017";
const mongo_db_name = "SBB";


router.use(session({
    secret: 'cmpos', cookie: { maxAge: 60000000 },
    resave: true, saveUninitialized: false
}));


router.post('/order/', function (req, res) {
    res.end("Count: " + req.body.name);
});

router.delete('/order/:name', function (req, res) {
    res.end("delete : " + req.params.name);
});

router.get('/order/:orderref', function (req, res) {
    console.log("orders");
    mongoClient.connect(mongo_string, function (err, client) {
        if (err) throw err;
        var db = client.db(mongo_db_name);
        db.collection('Orders').findOne({ "OrderRef": req.params.orderref }, function (findErr, result) {
            if (findErr) throw findErr;
            console.log(result);
            res.json(result);
            client.close();
        });
    });
});

router.get('/order/', function (req, res) {
    console.log("orders");
    mongoClient.connect(mongo_string, function (err, client) {
        if (err) throw err;
        var db = client.db(mongo_db_name);
        db.collection('Orders').find().toArray(function (findErr, result) {
            if (findErr) throw findErr;
            console.log(result);
            res.json(result);
            client.close();
        });
    });
});


router.get('/productAsset/', function (req, res) {
    mongoClient.connect(mongo_string, function (err, client) {
        if (err) throw err;
        var db = client.db(mongo_db_name);
        db.collection('Orders').aggregate([
            {
                $lookup:
                    {
                        from: 'Assets',
                        localField: 'MemberRef',
                        foreignField: 'MemberRef',
                        as: 'Asssets'
                    }
            }
            , { $sort: { CreateDate: 1 } }
        ])
        .toArray(function (findErr, result) {
            if (findErr) throw findErr;
            res.json(result);
            client.close();
        });
    });
});

router.post('/fileUpload/', function (req, res) {
    console.log("Upload File");
    try {
        var form = new formidable.IncomingForm();
        var newname = Date.now();
        form.parse(req, function (err, fields, files) {
  
            var oldpath = files.filetoupload.path;
            var newpath = path.resolve("node/uploaded/images/") + "/" + newname + "." + files.filetoupload.name.split(".")[1];
            console.log("old path " + oldpath);
            console.log("new path " + newpath);
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('[{"success":1,"messege":"File uploaded and moved!","name":"' + newname + "." + files.filetoupload.name.split(".")[1] + '"}]');
                res.end();
            });
        });
    } catch (err) {
        console.log("err : " + err);
    }
  });

  
module.exports = router;

