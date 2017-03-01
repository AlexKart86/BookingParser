'use strict';
var tst = require('./task.js');
var ee = require('events');

/*var task = new tst.Task({a: 2});

console.log(task.task_id);
console.log(task.state);
console.log(task.last_result);*/

class Ct extends ee.EventEmitter
{
    constructor()
    {
        super();
        this.x = Array(9).fill('x');
    }
}

var m = new Ct();

console.log(m.x);

