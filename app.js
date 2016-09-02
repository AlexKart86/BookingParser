var parser = require('./parser');





parser.ask_token(function (token) {
    console.log(token);
    parser.find_trains(2200001, 2218000, new Date('04.09.2016'), token, function(train_obj){
      console.log(train_obj);
    });
});




/*var fs = require('fs');

var str =  fs.readFileSync('./Test/station_lv.json', 'utf-8');

var obj = JSON.parse(str);

console.log(obj);*/

