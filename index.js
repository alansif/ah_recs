const tsdb = require('./config').tsdb;

const fs = require('fs-extra');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    if(req.method==="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else next();
});

let endpoints = [];

const filename = './endpoints.json';

fs.readJson(filename, (err, obj)=>{
    if (err){
        console.error(err);
        return;
    }
    console.log(obj);
    endpoints = obj;
});

function writedb() {
    fs.writeJson(filename, endpoints, {spaces: 4}, err=>{
        if (err) console.error(err);
    })
}

app.get('/tsdb', function(req, res){
    res.status(200).json({tsdb});
});

app.get('/endpoints', function(req, res){
    res.status(200).json(endpoints);
});

app.post('/endpoints', function(req, res){
    let eps = req.body.endpoints || [];
    endpoints = [];
    eps.forEach(x=>{
        endpoints.push({
            ip: x.ip,
            label: x.label,
            enabled: x.enabled
        });
    });
    writedb();
    res.sendStatus(200);
});

let formidable = require('formidable'),
    http = require('http'),
    util = require('util');

/*
http.createServer(function(req, res) {
  console.log(req.url);
  console.log(req.method);
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
		console.log(files);
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
	  res.end(util.inspect({fields: fields, files: files}));
	  fs.move(files.file.path, 'd:/abc.txt', function(err) {
		  if (err)
			  console.log(err);
	  });
    });
     return;
  }
 
  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(9680);
*/

app.get('/', function(req, res){
    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="afile" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
});

app.post('/upload', function(req, res){
    // parse a file upload
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        console.log(files);
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
        if (!!files.afile) {
            fs.move(files.afile.path, 'd:/abc.txt', function(err) {
                if (err)
                    console.log(err);
            });
        } else {
            res.sendStatus(400);
        }
    });
});

app.use(function(req, res){
//    console.log(req.headers);
//    console.log(req.body);
    res.sendStatus(404);
});

const server = app.listen(9680, "0.0.0.0", function() {
    console.log('listening on port %d', server.address().port);
});