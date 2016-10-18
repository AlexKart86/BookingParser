var fs = require('fs');
var config = require('./config');
var parser = require('./parser');

var subscribe_list = {};

function save_db()
{
    fs.writeFileSync(config.subscribe_db_path, JSON.stringify(subscribe_list, "", 4));
}

function init(){
    subscribe_list = JSON.parse(fs.readFileSync(config.subscribe_db_path));
}

//Добавить задачу на отслеживание
function add_edit_subscribe(task_id, task){
    if (!subscribe_list[task_id])
        subscribe_list[task_id] = {};
    subscribe_list[task_id].task = task;
    save_db();
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
    if (!subscribe_list[task_id])
        callback(new Error("Задача с кодом " + task_id + " не найдена"), null);
    else {
        var task_info = subscribe_list[task_id].task;
        //station_id_from, station_id_to, date_dep, token, train_num
        parser.ask_token(function(error, token){
            if (error)
                callback(error, null);
            else{
              //Ищем поезда по номеру в наши даты отправления   
              parser.find_trains_by_num(task_info.station_id_from, task_info.station_id_to,
                task_info.date_dep, token, function(error, data){
                      if (error)
                          callback(error, null);
                      else {
                          //Нет нужного поезда
                          if (data == null)
                              callback(null, null);
                          else{
                              
                              //TO DO тут будет еще дополнительная фильтрация 
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
module.exports.init = init;
module.exports.debug = debug;
