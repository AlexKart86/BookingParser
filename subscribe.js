var fs = require('fs');
var config = require('./config');

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

function debug(){
    console.log(subscribe_list);
}

module.exports.remove_subscribe = remove_subscribe;
module.exports.add_edit_subscribe = add_edit_subscribe;
module.exports.init = init;
module.exports.debug = debug;
