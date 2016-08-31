var jjencode = require('./jjencode');
var fs = require('fs');

data = fs.readFileSync('./Test/tst.txt');

console.log(jjencode.jjdecode(data));