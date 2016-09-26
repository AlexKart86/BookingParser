'use strict';
/**
 * Created by alex_kart on 31.08.2016.
 */
var http = require('http');
var request = require('request');
var qs = require('querystring');
var jjencode = require('./jjencode');
var config = require('./config.js');
var util = require('util');


function BookingAnswerError(message){
    this.message = message;
}

util.inherits(BookingAnswerError, Error);
BookingAnswerError.prototype.name = "BookingAnswerError";

function PropertyError(property){
    this.property = property;
    this.message = "Отсутствует поле "+property;
}

util.inherits(PropertyError, Error);
PropertyError.prototype.name = "PropertyError";

function check_property(obj, prop){
    if (!obj.hasOwnProperty(prop))
        throw new PropertyError(prop);
}

function copy_prop_with_check(source, dest, prop_name){
    check_property(source, prop_name);
    source[prop_name] = dest[prop_name];
}

//Создает объект "Поезд" по данным, пришедшим от УЗ
function Train(json){
  copy_prop_with_check(json, this, "num");
  copy_prop_with_check(json, this, "model");
  copy_prop_with_check(json, this, "category");
    
}

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

var main_req =
    (function(){
      return config.is_use_proxy ? request.defaults(
              {proxy: config.proxy_host+":" + config.proxy_port,
                  jar: true,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}}) :
          request.defaults(
              {  jar: true,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
  } )();

//Получает главную страницу букинга
function get_main_page_html(callback){
    //console.log(config);
    var options = {uri: config.booking_url_ru};
    main_req(options, callback);
}

function formatDateUZ(date){
   // return dt(date, "dd.mm.yyyy");
    return date;
}

function ask_token(callback){
    get_main_page_html(function(error, response, body){
       if (!error && response.statusCode == 200){
           var token = parse_token_from_html(body)
           callback(null, token);
       }
       else {
           callback(error, null);
       }
    })
}

function find_trains(station_id_from, station_id_to, date_dep, token,  callback){
    var options = {
        url: config.booking_search_train_url,
        headers: {
           'GV-Ajax': '1',
           'GV-Referer': config.booking_url_ru,
           'GV-Token': token
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
           try{
                var obj = JSON.parse(body);
                console.log(obj);
                if (obj.error)
                  callback(new BookingAnswerError(obj.error), null);
                else
                  callback(null, obj.value);
           }
           catch (e){
               callback(e, null); 
           }
       }
       else 
           callback(error, null);
    });
}


//find trains with seats detail
function find_trains_ext(station_id_from, station_id_to, date_dep, token, callback){
    find_trains(station_id_from, station_id_to, date_dep, token, function (err, data) {
       if (err) {
           callback(err, null);
           return;
       }



    });
}


function ask_station_list(keywords, callback){
    var options = {
        url: config.booking_search_station_prefix + encodeURIComponent(keywords) + '/',
        method: 'POST'
    };
    main_req(options, function(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);
                console.log(obj);
                if (obj.error) {
                   callback(new BookingAnswerError(obj.value), null);
                   return;
                }
                if (!obj.value) {
                  callback(new BookingAnswerError("В списке станций нет value"), null);
                  return;
                }
                callback(null, obj.value);
            }
            else {
                callback(error, null);
            }
        }
        catch (e){
           callback(e, null)
        }
    });
}

module.exports.ask_token = ask_token;
module.exports.find_trains = find_trains;
module.exports.ask_station_list = ask_station_list;

//for test only
module.exports.format_date = formatDateUZ;

