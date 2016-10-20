var fs = require('fs');
var assert = require('assert');
var config = require('./config');
var parser = require('./parser');


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
    subscribe_list[task_id].last_change_results = null;

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

    //Функа аналирует данные по поезду и в соответствии с заданием выставляет решение 
    function analyze_solution(solution, task_item){
        var solve = {};
        if (solution.length == 0)
          return;

        var task = task_item.task;
        solve.num = task.num;
        solve.types = task.types;

        var v_is_solution_found = false;
        if (task.is_report_all){
            v_is_solution_found = true;
        }
        else {
            solve.types.forEach(function(item){
                if (task.is_report_kupe && item.title == "Купе")
                    v_is_solution_found = true;
                if (task.is_report_plac && item.title == "Плацкарт")
                    v_is_solution_found = true;
                if (v_is_solution_found)
                    return;
            });
        }
        if (v_is_solution_found)
        {
            if (!deepCompare(task_item.prev_solve, solution)){
                task_item.prev_solve = solution;
                task_item.last_change_results = new Date();
            }
        }

    };



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
                              analyze_solution(data, subscribe_list[task_id]);
                              save_db();
                              callback(null, subscribe_list[task_id]);  
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



module.exports.remove_subscribe = remove_subscribe;
module.exports.add_edit_subscribe = add_edit_subscribe;
module.exports.run_task = run_task;
module.exports.init = init;
module.exports.debug = debug;
