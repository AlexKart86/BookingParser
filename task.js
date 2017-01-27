/**
 * Created by alex_kart on 10.11.2016.
 */

'use strict';

var ee = require('events');
var parser = require('./parser');


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

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

/*
function Task(options){
    var self = this;
    var options = options;
    var last_result = LAST_RESULT.NOT_RUNNING;

    Object.defineProperty(self, 'last_result',
        {
            value: LAST_RESULT.NOT_RUNNING,
            writable: false,
            configurable: true
        });

    var state = TASK_STATE.SUSPENDED;
    Object.defineProperty(self, 'state',
        {
            writable: false
        });
    last_result = LAST_RESULT.SUCCESS;
}

Task.prototype = new ee.EventEmitter();*/

class Task extends ee.EventEmitter{
    constructor (options){
       super();
       this.options = options;
       this._task_id = guid();
       this._state = TASK_STATE.SUSPENDED;
       this._last_result = LAST_RESULT.NOT_RUNNING;
    };
    get _state() {return this._state};
    set _state(value)
    {
        if (value != this._state)
        {
            super.emit()
        }
    }
    get state()
    {
        return this._state;
    }
    get last_result()
    {
        return this._last_result;
    }
    get task_id (){
        return this._task_id;
    };
    
    

}

module.exports.Task =  Task;
module.exports.LAST_RESULT = LAST_RESULT;