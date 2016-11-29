/**
 * Created by alex_kart on 10.11.2016.
 */


var ee = require('events');
var parser = require('./parser');

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
    'use strict';
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

Task.prototype = new ee.EventEmitter();

module.exports.Task =  Task;
module.exports.LAST_RESULT = LAST_RESULT;