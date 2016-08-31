var jjencode = require('./jjencode');
var http = require('http');
var config = require('./config.js');


function get_token(content){
    var regexp =  /(\[\'_trackPageview\'\]\);)(.+)(\(function)/im;
    var code =  content.match(regexp)[2];
    var js_token_code =  jjencode.jjdecode(code);
    console.log(js_token_code);
    var js_regexp = /(, ")(.*)("\))/im;
    var js_token = js_token_code.match(js_regexp)[2];
    console.log(js_token);
}

var  req = http.request({
    host: config.proxy_host,
    port: config.proxy_port,
    path: config.booking_url
},
    function (resp){
        var content = "";

        resp.on('error', function(e){
            throw Error(e.message);
        });

        resp.on('data', function(data){
            content += data;
        });

        resp.on('end', function (){
          // console.log(content);
           get_token(content);
        } );
    }
);


req.end();
