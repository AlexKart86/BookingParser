var fs = require('fs');
var assert = require('assert');
var config = require('./config');
var parser = require('./parser');


function Task(task_params){
    
}



var subscribe_list = {};

//Сперто из
//http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
function deepCompare () {
    var i, l, leftChain, rightChain;

    function compare2Objects(x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {

        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }
    return true;
}


// Object.prototype.equals = function(x)
// {
//     var p;
//     for(p in this) {
//         if(typeof(x[p])=='undefined') {return false;}
//     }
//
//     for(p in this) {
//         if (this[p]) {
//             switch(typeof(this[p])) {
//                 case 'object':
//                     if (!this[p].equals(x[p])) { return false; } break;
//                 case 'function':
//                     if (typeof(x[p])=='undefined' ||
//                         (p != 'equals' && this[p].toString() != x[p].toString()))
//                         return false;
//                     break;
//                 default:
//                     if (this[p] != x[p]) { return false; }
//             }
//         } else {
//             if (x[p])
//                 return false;
//         }
//     }
//
//     for(p in x) {
//         if(typeof(this[p])=='undefined') {return false;}
//     }
//
//     return true;
// }


function save_db()
{
    fs.writeFileSync(config.subscribe_db_path, JSON.stringify(subscribe_list, "", 4));
}

function init(){
    subscribe_list = JSON.parse(fs.readFileSync(config.subscribe_db_path));
}

//Добавить задачу на отслеживание
function add_edit_subscribe(task_id, task){

    var v_task_id = null;

    for (var cur_task_id in subscribe_list ){
        if (subscribe_list.hasOwnProperty(cur_task_id)){
            if (deepCompare(subscribe_list[cur_task_id].task, task)){
                v_task_id = cur_task_id;
            }
        }
    }

    if (v_task_id != null)
        return v_task_id;

    if (!subscribe_list[task_id])
        subscribe_list[task_id] = {};
    subscribe_list[task_id].task = task;
    // subscribe_list[task_id].is_running = false;
    // subscribe_list[task_id].is_solution_found = false;
    subscribe_list[task_id].prev_solve = {};
    //Текстовое описалово с тем, что мы нашли
    subscribe_list[task_id].prev_solve_txt = "";
    subscribe_list[task_id].last_change_results = null;
    subscribe_list[task_id].is_running = false;

    save_db();
    return task_id;
}

//Удалить задачу на отслеживание
function remove_subscribe(task_id){
    delete subscribe_list[task_id];
}

//Выполнить задачу по поиску
//Выполняет задачу с заданным ИД и
//дергает коллбек, куда пихаем объект результат
//Или undefined если ничего не найдено
function run_task(task_id, callback){

    //Схема мест купе в плацкарте
    var kupe_4 = {
        "1-4": [1, 2, 3, 4],
        "5-8": [5, 6, 7, 8],
        "9-12": [9, 10, 11, 12],
        "13-16": [13, 14, 15, 16],
        "17-20": [17, 18, 19, 20],
        "21-24": [21, 22, 23, 24],
        "25-28": [25, 26, 27, 28],
        "29-32": [29, 30, 31, 32],
        "33-36": [33, 34, 35, 36]
    };

    //Схема мест купе в плацкарте с боковушками
    var kupe_6= {
        "2 купе": [5, 6, 7, 8, 51, 52],
        "3 купе": [9, 10, 11, 12, 49, 50],
        "4 купе": [13, 14, 15, 16, 45, 46],
        "5 купе": [21, 22, 23, 24, 43, 44],
        "6 купе": [25, 26, 27, 28, 41, 42],
        "7 купе": [29, 30, 31, 32, 39, 40],
        "8 купе": [33, 34, 35, 36, 37, 38] };

    function is_array_include(small_arr, big_arr){
        return small_arr.every(function(element){
            return big_arr.indexOf(element) >= 0;
        })
    }

    //Функа аналирует данные по поезду и в соответствии с заданием выставляет решение 
    function analyze_solution(solution, task_item){
        var solve = {};
        if (solution.length == 0)
          return;

        var task = task_item.task;
        solve.num = solution.num;
        solve.types = solution.types;


        var txt_result = "";
        var v_is_solution_found = false;
        var v_is_need_lookup_for_places = is_need_lookup_for_places(task_item);


        txt_result = `Поезд ${solve.num} \n`;

        solve.types.forEach(function(item){
           //Случай, когда надо просто сообщить о наличии мест
           if (!v_is_need_lookup_for_places){
               if (task.is_report_all)
                   v_is_solution_found = true;
               //Сообщать если появились купе
               if (task.is_report_kupe && item.title == "Купе")
                   v_is_solution_found = true;
               //Сообщать, если появились плацкарты
               if (task.is_report_plac && item.title == "Плацкарт")
                   v_is_solution_found = true;
               //Сообщать если плацкартов стало меньше чем
               if (item.title == "Плацкарт" &&
                   task.is_report_less_plac &&
                   parseInt(item.places) < parseInt(task.cnt_less_plac) )
                   v_is_solution_found = true;
               //Сообщать если плацкартов больше чем
               if (item.title == "Плацкарт" &&
                   task.is_report_greatest_plac &&
                   parseInt(item.places) > parseInt(task.cnt_greatest_plac) )
                   v_is_solution_found = true;
               txt_result += `${item.title}: ${item.places} \n`;
           }
           else{
              //Надо делать более глубокий анализ по плацкартам
              if (item.title == "Плацкарт"){
                    //Пробегаемся по вагонам
                    item.place_detail.forEach(function(coach){
                         for (var i in coach.places) {
                            var coach_detail = coach.places[i].map(item => parseInt(item));
                            var finded_places = "";
                            coach_detail.sort(function(a,b){return a-b; });
                            coach_detail.forEach(function(place_num){
                                if (task.is_report_low_plac && (place_num % 2)) {
                                    finded_places += ` ${place_num}`;
                                    v_is_solution_found = true;
                                }
                                if (task.is_report_high_plac && !(place_num %2)) {
                                    finded_places += ` ${place_num}`;
                                    v_is_solution_found = true;
                                }
                            });
                            if (task.is_report_full_kupe_4){
                                for (var kupe_name in kupe_4){
                                    if (is_array_include(kupe_4[kupe_name], coach_detail)){
                                        finded_places += ` ${kupe_name}`;
                                        v_is_solution_found = true;
                                    }
                                }
                            }
                            if (task.is_report_full_kupe_6){
                                for (var kupe_name in kupe_6){
                                    if (is_array_include(kupe_6[kupe_name], coach_detail)){
                                        finded_places += ` ${kupe_name}`;
                                        v_is_solution_found = true;
                                    }
                                }
                            }
                        }
                        if (finded_places.length)
                          txt_result += `Вагон: ${coach.num} ` + finded_places + '\n';
                    });
              }

           }


        });

        // if (task.is_report_all){
        //     v_is_solution_found = true;
        // }
        // else {
        //     solve.types.forEach(function(item){
        //         //Сообщать если появились купе
        //         if (task.is_report_kupe && item.title == "Купе")
        //             v_is_solution_found = true;
        //         //Сообщать, если появились плацкарты
        //         if (task.is_report_plac && item.title == "Плацкарт")
        //             v_is_solution_found = true;
        //         //Сообщать если плацкартов стало меньше чем
        //         if (item.title == "Плацкарт" &&
        //             task.is_report_less_plac &&
        //             parseInt(item.places) <= parseInt(task.cnt_less_plac) )
        //             v_is_solution_found = true;
        //         //Сообщать если плацкартов больше чем
        //         if (item.title == "Плацкарт" &&
        //             task.is_report_greatest_plac &&
        //             parseInt(item.places) >= parseInt(task.cnt_greatest_plac) )
        //             v_is_solution_found = true;
        //         if (!v_is_solution_found && is_need_lookup_for_places(task_item)){
        //             console.log(solution);
        //         }
        //         if (v_is_solution_found)
        //             return;
        //     });
        // }
        
            //TOdo надо проверять по всей видимости не само решение а только текстовое представление
        if (!deepCompare(task_item.prev_solve, solve)){
                task_item.last_change_results = new Date();
        }
        task_item.prev_solve = solve;
        task_item.prev_solve_txt  = txt_result;
        task_item.is_solution_found = v_is_solution_found;

    }

    function is_need_lookup_for_places(task_item ){
        "use strict";
        let task = task_item.task;
        return task.is_report_full_kupe_4 || task.is_report_full_kupe_6 ||
               task.is_report_low_plac || task.is_report_high_plac;

    }



    if (!subscribe_list[task_id])
        callback(new Error("Задача с кодом " + task_id + " не найдена"), null);
    else {
        var task_info = subscribe_list[task_id].task;
        //station_id_from, station_id_to, date_dep, token, train_num
        //subscribe_list[task_id].is_running = true;
        parser.ask_token(function(error, token){
            if (error)
                callback(error, null);
            else{
              //Ищем поезда по номеру в наши даты отправления   
              parser.find_trains_by_num(task_info.station_id_from, task_info.station_id_to,
                task_info.date_dep, token, task_info.train, function(error, data){
                      if (error)
                          callback(error, null);
                      else {
                          //Нет нужного поезда
                          if (data == null)
                              callback(null, null);
                          else{
                              if (is_need_lookup_for_places(subscribe_list[task_id])){
                                  var promise_arr = [];

                                  parser.lookup_places(task_info.station_id_from, task_info.station_id_to,
                                      task_info.date_dep, data, token,
                                  function(error, places_info){
                                      "use strict";
                                      if (error)
                                          callback(error, null);
                                      else{
                                          // data.places_info = places_info;
                                          //console.log(places_info);
                                          analyze_solution(data, subscribe_list[task_id]);
                                          save_db();
                                          callback(null, subscribe_list[task_id]);
                                      }
                                  }, 'П');
                              }
                              else {
                                  analyze_solution(data, subscribe_list[task_id]);
                                  save_db();
                                  callback(null, subscribe_list[task_id]);
                              }
                          }
                      }
                  });
            }
        });

    }
}


function debug(){
    console.log(subscribe_list);
}

function get_tasks(){
    return subscribe_list;
}


module.exports.remove_subscribe = remove_subscribe;
module.exports.add_edit_subscribe = add_edit_subscribe;
module.exports.run_task = run_task;
module.exports.init = init;
module.exports.debug = debug;
module.exports.get_tasks = get_tasks;
