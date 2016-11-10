var tst = require('./task.js');

var task = new tst.Task({a: 2});

task.on('change', function(){
   console.log(this.last_result);
});

task.on('change', function(){
   console.log('change2')
});

//console.log(task.last_result);
task.last_result = tst.LAST_RESULT.SUCCESS;
//console.log(task.last_result);

