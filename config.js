var config = {};

//for NDI PIT
//config.is_use_proxy = true;
//config.server_ip = '192.168.1.40';
//config.server_port = 2233;
//config.proxy_port = 3128;
//config.proxy_host = 'http://proxy.ndipit.com.ua';

//for home

 config.is_use_proxy = false;
 config.server_ip = 'localhost';
 config.server_port = 2233;




config.booking_url = 'http://booking.uz.gov.ua';
config.booking_url_ru =  config.booking_url +  '/ru/';
config.booking_search_train_url = 'http://booking.uz.gov.ua/ru/purchase/search/';
config.booking_search_station_prefix = 'http://booking.uz.gov.ua/ru/purchase/station/';
config.booking_search_coaches_url = 'http://booking.uz.gov.ua/ru/purchase/coaches/';
config.booking_search_places_url = 'http://booking.uz.gov.ua/ru/purchase/coach/';

config.subscribe_db_path = 'DB/subscribe_db.json';

module.exports = config;
