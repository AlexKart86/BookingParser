var parser = require('./parser');
var http = require('http');
var fs = require('fs');
var path = require('path');


var server =  http.createServer(function(req, res){
  switch (req.url) {
      case '/':
          sendFile(res, 'html/index.html');
          break;
      default :
          try {
              var file_full_path = path.resolve(__dirname, '.'+req.url);
              var stats = fs.statSync(file_full_path);
              if (stats.isFile()){
                  sendFile(res, file_full_path);
              }
          }
              catch (err){
                  res.statusCode = 400;
                  res.body = err.message;
                  console.error(err.message);
                  res.end();
          }
  }
});



function sendFile(res, filename){
    fs.readFile(filename, function(err, data){
        if (err){
            res.statusCode = 404;
            res.end();
        }
        else{
            res.write(data);
            res.end();
        }

    })
}

server.listen(2233, 'localhost');


parser.ask_token(function (token) {
    console.log(token);
    var d = new Date();
    d.setDate(d.getDate()+2);
    parser.find_trains(2200001, 2218000, d, token, function(train_obj){
      console.log(train_obj);
    });
});





/*var fs = require('fs');

var str =  fs.readFileSync('./Test/station_lv.json', 'utf-8');

var obj = JSON.parse(str);

console.log(obj);*/

