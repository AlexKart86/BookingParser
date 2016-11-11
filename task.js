/**
 * Created by alex_kart on 10.11.2016.
 */

var ee = require('events');

//
const TASK_STATE = {
    SUSPENDED: 1,
    RUNNING: 2
};

const LAST_RESULT = {
    NOT_RUNNING: 1,
    SUCCESS: 2,
    FAILED: 3
};


function Task(options){
    var self = this;
    var options = options;
    
    var last_result = LAST_RESULT.NOT_RUNNING;
    self.__defineGetter__("last_result", function(){
        return last_result;
    });
    self.__defineSetter__("last_result", function(value){
       self.emit("change"); 
       last_result = value;
    });

    var state = TASK_STATE.SUSPENDED;
    self.__defineGetter__("state", function(){
        
    })
}

Task.prototype =  new ee.EventEmitter;

module.exports.Task = Task;
module.exports.LAST_RESULT = LAST_RESULT;