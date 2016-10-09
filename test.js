function formatDateUZ(date){
    // return dt(date, "dd.mm.yyyy");
    var day =  date.substr(0, 2);
    var month = date.substr(3, 2);
    var year = date.substr(6, 4);
    return (new Date(year, month-1, day)).getTime()/1000;
}

console.log(formatDateUZ("29.10.2016"));