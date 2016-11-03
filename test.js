// var subscribe = require('./subscribe');
//
// subscribe.init();
//
// subscribe.add_edit_subscribe(1, {
//     station_id_from: 1111,
//     station_id_to: 2222,
//     train: 'К99',
//     is_warn_when_kupe: true,
//     is_warn_when_plac: true
// });
//
// subscribe.add_edit_subscribe(1, {
//     station_id_from: 1111,
//     station_id_to: 2223,
//     train: 'К99',
//     is_warn_when_kupe: true,
//     is_warn_when_plac: true
// });
//
// subscribe.add_edit_subscribe(3, {
//     station_id_from: 1111,
//     station_id_to: 444,
//     train: 'К99',
//     is_warn_when_kupe: true,
//     is_warn_when_plac: true
// });
//
// subscribe.debug();

var i = 11;

var value1 = "073 К";
var value2 = "073 ssdsd";



console.log(parseFloat(value1.replace(/[^\/\d]/g,'')));
console.log(parseFloat(value2.replace(/[^\/\d]/g,'')));