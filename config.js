var config = {};

//config.proxy_port = 3128;
//config.proxy_host = 'http://proxy.ndipit.com.ua';
config.booking_url = 'http://booking.uz.gov.ua';
config.booking_url_ru =  config.booking_url +  '/ru/';
config.booking_search_train_url = 'http://booking.uz.gov.ua/ru/purchase/search/';
config.booking_search_station_prefix = 'http://booking.uz.gov.ua/ru/purchase/station/';

module.exports = config;
