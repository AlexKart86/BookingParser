/**
 * Created by alex_kart on 31.08.2016.
 */
var http = require('http');
var request = require('request');
var jjencode = require('./jjencode');
var config = require('./config.js');


//Парсит токен из хтмл текста
function parse_token_from_html(content){
    var regexp =  /(\[\'_trackPageview\'\]\);)(.+)(\(function)/im;
    var code =  content.match(regexp)[2];
    var js_token_code =  jjencode.jjdecode(code);
    console.log(js_token_code);
    var js_regexp = /(, ")(.*)("\))/im;
    var js_token = js_token_code.match(js_regexp)[2];
    console.log(js_token);
}

function get_main_page_html(callback){
    var options = {
        url: config.booking_url,
        proxy: config.proxy_host+":" + config.proxy_port
    };
    request(options, callback);
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
            get_token(content);
        } );
    }
);

req.end();



function ask_token(callback){

}