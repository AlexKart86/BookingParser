var parser = require('./parser');
var http = require('http');
var fs = require('fs');


var server =  http.createServer(function(req, res){
  switch (req.url) {
      case '/':
          sendFile(res, 'html/index.html');
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

