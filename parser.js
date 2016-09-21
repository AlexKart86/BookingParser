'use strict';
/**
 * Created by alex_kart on 31.08.2016.
 */
var http = require('http');
var request = require('request');
var qs = require('querystring');
var jjencode = require('./jjencode');
var config = require('./config.js');
var dt = require('dateformat');



//Парсит токен из хтмл текста
function parse_token_from_html(content){
    var regexp =  /(\[\'_trackPageview\'\]\);)(.+)(\(function)/im;
    var code =  content.match(regexp)[2];
    var js_token_code =  jjencode.jjdecode(code);
    //console.log(js_token_code);
    var js_regexp = /(, ")(.*)("\))/im;
    var js_token = js_token_code.match(js_regexp)[2];
    return js_token;
}

var main_req = request.defaults({
   jar: true,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}});

//Получает главную страницу букинга
function get_main_page_html(callback){
    //console.log(config);
    var options = {uri: config.booking_url_ru};
    main_req(options, callback);
}




/*
var  req = http.request({
        host: config.proxy_host,
        port: config.proxy_port,
        path: config.booking_url_ru
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

req.end();*/

function formatDateUZ(date){
    return dt(date, "dd.mm.yyyy");
}

function ask_token(callback){
    get_main_page_html(function(error, response, body){
       if (!error && response.statusCode == 200){
           var token = parse_token_from_html(body)
           callback(token);
       }
       //TO DO error raising
    })
}

function find_trains(station_id_from, station_id_to, date_dep, token,  callback){
    var options = {
        url: config.booking_search_train_url,
        headers: {
           'GV-Ajax': '1',
           'GV-Referer': config.booking_url_ru,
           'GV-Token': token,
        },
        method: 'POST',
        body: qs.stringify({
            'station_id_from': station_id_from,
            'station_id_till': station_id_to,
            'date_dep': formatDateUZ(date_dep),
            'time_dep': "00:00",
            'time_dep_till': null,
            'another_ec': null,
            'search': null
        })
    };

    main_req(options, function(error, response, body){
       if (!error && response.statusCode == 200){
         var obj = JSON.parse(body);
         console.log(obj);
           if (obj.error){
             throw Error(obj.value);
         }
         callback(obj);
       }
        //TO DO error handling
    });
}

function ask_station_list(keywords, callback){
    var options = {
        url: config.booking_search_station_prefix + encodeURIComponent(keywords) + '/',
        method: 'POST'
    };
    main_req(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //TO DO error handling
            var obj = JSON.parse(body);
            console.log(obj);
            if (obj.error) {
                throw Error(obj.value);
            }
            if (!obj.value) {
                throw Error("В списке станций нет value");
            }
            //console.log(obj.value);
            callback(obj.value);
        }
        else {
            console.log(`error: ${error}, resp: ${response.statusCode}`);
        }
    });
}

module.exports.ask_token = ask_token;
module.exports.find_trains = find_trains;
module.exports.ask_station_list = ask_station_list;

