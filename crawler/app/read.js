var debug = require('debug'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    PATH = {
        "urldatabase" : "./crawler/data/database.json",
        "pricedata" : "./crawler/data/estate.json"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log;

/*
* 初始化价格数据库
* */
function initPriceData(){
    return fs.readFileSync(PATH.pricedata,'utf8');
}