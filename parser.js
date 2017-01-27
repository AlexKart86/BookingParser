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

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

function BookingAnswerError(message){
    this.message = message;
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, BookingAnswerError);
    } else {
        this.stack = (new Error()).stack;
    }
}

util.inherits(BookingAnswerError, Error);
BookingAnswerError.prototype.name = "BookingAnswerError";

/*function PropertyError(property){
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
    dest[prop_name] = source[prop_name];
}


//Создает объект "Поезд" по данным, пришедшим от УЗ
function Train(json){
  copy_prop_with_check(json, this, "num");
  copy_prop_with_check(json, this, "model");
  copy_prop_with_check(json, this, "category");
  copy_prop_with_check(json, this, "from");
  copy_prop_with_check(json, this, "till");
}*/

//Парсит токен из хтмл текста
function parse_token_from_html(content){
    //var regexp =  /(\[\'_trackPageview\'\]\);)(.+)(\(function)/im;
    //var code =  content.match(regexp)[2];

    var regexp = /(Common\.setOpacHover)(.*)(;\}\);)(.*)(<\/script>)/im;
    var code = content.match(regexp)[4];

    var js_token_code =  jjencode.jjdecode(code);
    console.log(js_token_code);
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
    var day =  date.substr(0, 2);
    var month = date.substr(3, 2);
    var year = date.substr(6, 4);
    return (new Date(year, month-1, day)).getTime()/1000;
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
            'date_dep': date_dep,
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
                //console.log(obj);
                if (obj.error)
                  callback(new BookingAnswerError(obj.value), null);
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

//Поискать поезд по имени на заданные условия отправления
//Возвращает не только модель и название поезда
//но и всю колбасню, возвращаемую нам УЗ
function find_trains_by_num(station_id_from, station_id_to, date_dep, token, train_num, callback){
    find_trains(station_id_from, station_id_to, date_dep, token, 
      function(error, data){
         var is_train_found = false;
         if (error)
             callback(error, null);
         else {
             //Пробегаемся по всем поездам
             if (isIterable(data))
                 data.forEach(function(item){
                    if (parseInt(item.num.replace(/[^\/\d]/g,''))  == parseInt(train_num.replace(/[^\/\d]/g,''))) {
                        is_train_found = true;
                        callback(null, item);
                        return;
                    }
                 });
             if (!is_train_found)
               callback(new Error("Поездов не найдено"), null);
         }
      });
}

//Return list of places in coach
function find_places_in_coach(station_id_from, station_id_to, date_dep, train,
                              coach_num, coach_type_id, coach_class, token, callback){
    var options = {
        url: config.booking_search_places_url,
        headers: {
            'GV-Ajax': '1',
            'GV-Referer': config.booking_url_ru,
            'GV-Token': token
        },
        method: 'POST',
        body: qs.stringify({
            'station_id_from': station_id_from,
            'station_id_till': station_id_to,
            'train': train,
            'coach_num': coach_num,
            'coach_class': coach_class,
            'coach_type_id': coach_type_id,
            'date_dep': formatDateUZ(date_dep),
            'change_scheme': 1
        })
    };
    main_req(options, function(error, response, body){
        if (!error && response.statusCode == 200){
            try{
                var obj = JSON.parse(body, function(key, value){
                    if (key == "content")
                        return undefined;
                    else
                        return value;
                });
                if (obj.error) {
                    console.error(obj.value);
                    callback(new BookingAnswerError(obj.value), null);
                }
                else {
                    //console.log(obj.value);
                    callback(null, obj.value.places);
                }
            }
            catch (e){
                callback(e, null);
            }
        }
        else
            callback(error, null);
    });
}

//Find free seats in train by coach_type
function find_coaches(station_id_from, station_id_to, date_dep, train, model,
                       coach_type, token, callback){
    var options = {
        url: config.booking_search_coaches_url,
        headers: {
            'GV-Ajax': '1',
            'GV-Referer': config.booking_url_ru,
            'GV-Token': token
        },
        method: 'POST',
        body: qs.stringify({
            'station_id_from': station_id_from,
            'station_id_till': station_id_to,
            'date_dep':  formatDateUZ(date_dep),
            'train': train,
            'model': model,
            'coach_type': coach_type,
            'round_trip': 0,
            'another_ec': 0
        })
    };
    main_req(options, function(error, response, body){
        if (!error && response.statusCode == 200){
            try{
                var obj = JSON.parse(body, function(key, value){
                    var ignore_tags = ["content"];
                    if (ignore_tags.indexOf(key) > -1) return undefined;
                    return value;
                });
                if (obj.error) {
                    console.error(obj.error);
                    callback(new BookingAnswerError(obj.value), null);
                }
                else {
                    var coaches = obj.coaches;
                    var promises = [];
                    coaches.forEach(function (coach_item) {
                        var f = function(){
                            var p = new Promise(function(resolve, reject){
                                find_places_in_coach(station_id_from, station_id_to, date_dep, train, coach_item.num, coach_item.coach_type_id,
                                    coach_item.coach_class, token, function(error, data){
                                        if (error)
                                            reject(error);
                                        else
                                        {
                                            coach_item.places = data;
                                            resolve();
                                        }
                                    });
                            });
                            return p;
                        };
                       promises.push(f());
                    });
                    Promise.all(promises)
                        .then(function(data){
                            //console.log(coaches);
                            callback(null, coaches);
                        });
                }
            }
            catch (e){
                callback(e, null);
            }
        }
        else
            callback(error, null);
    });

}

function lookup_places(station_id_from, station_id_to, date_dep, train,
                       token, callback, filter_letter){
    var train_promises = [];
    var vagon_types = train.types;
    vagon_types.forEach(function (vagon_type) {
        if (!filter_letter || vagon_type.letter == filter_letter){
            var f = function () {
                var p = new Promise(function (resolve, reject) {
                    find_coaches(station_id_from, station_id_to, date_dep,
                        train.num, train.model, vagon_type.letter, token, function (error, data) {
                            if (error)
                                reject(error);
                            else
                                resolve(data);
                        });
                });
                p.then(function (data) {
                    vagon_type.place_detail = data;
                });
                return p;
            };
            train_promises.push(f());
        }
    });
    Promise.all(train_promises)
        .then(
            success => callback(null, vagon_types),
            error =>  callback(error, null));
}

//find trains with seats detail
function find_trains_ext(station_id_from, station_id_to, date_dep, token, callback){
    find_trains(station_id_from, station_id_to, date_dep, token, function (err, trains) {
       if (err) {
           callback(err, null);
           return;
        }
       
       if (!isIterable(trains)){
           callback(new BookingAnswerError("УЗ вернула пустой список поездов"), null);
           return;
       } 
         
       //Пробегаемся по всем поездам
       //Todo переписать через lookup_places
       var train_promises = [];
       trains.forEach(function(item){
          var f_train = function() {
              var pr_train =  new Promise(function(resolve, reject){
                  var vagon_types = item["types"];
                  //Пробегаемся по вагонам в поезде
                  var promise_arr = [];
                  vagon_types.forEach(function (vagon_type) {
                      var f = function () {
                          var p = new Promise(function (resolve, reject) {
                              find_coaches(station_id_from, station_id_to, date_dep,
                                  item.num, item.model, vagon_type.letter, token, function (error, data) {
                                      if (error)
                                          reject(error);
                                      else
                                          resolve(data);
                                  });
                          });
                          p.then(function (data) {
                              vagon_type.place_detail = data;
                          });
                          return p;
                      };
                      promise_arr.push(f());
                  });
                  Promise.all(promise_arr)
                      .then(
                          success => resolve(vagon_types),
                          error =>  reject(error));

              });
              return pr_train;
          };
          train_promises.push(f_train());
       });
       Promise.all(train_promises)
        .then(success => callback(null, trains),
              error => callback(error)
        );

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
                //console.log(obj);
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
module.exports.find_trains_ext = find_trains_ext;
module.exports.ask_station_list = ask_station_list;
module.exports.find_trains_by_num = find_trains_by_num;
module.exports.find_coaches = find_coaches;
module.exports.lookup_places = lookup_places;

//for test only
module.exports.format_date = formatDateUZ;

