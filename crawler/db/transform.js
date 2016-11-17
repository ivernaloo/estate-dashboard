var debug = require('debug'),
    fs = require('fs'),
    async = require('async'),
    PATH = {
        "pricedata" : "./crawler/data/estate.json",
        "data" : "./crawler/data/estate_format.js"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log;

format();
function format(){
    var TIME = [],
        ESTATE_GuanGu = [],
        ESTATE_Total = [],
        RESULTS = {};

    log = debug("format");

    async.series([
        function(done){

            TIME =
                    Object.keys(PRICEDATA).sort(function(a, b) {
                        return new Date(a) - new Date(b);
                    });

            TIME.forEach(function(key){
                ESTATE_GuanGu.push(PRICEDATA[key][0].replace(/\D/g,''))
                ESTATE_Total.push(PRICEDATA[key][1].replace(/\D/g,''))
              })

            RESULTS = {
                "time" : TIME,
                "guangu" : ESTATE_GuanGu,
                "total" : ESTATE_Total
            };

            done();        },

        function(done){
            fs.writeFile(PATH.data, "var DATA = " + JSON.stringify(RESULTS), function (err) {
                if (err) throw err;
                console.log('格式化了所有数据');
            });

        }
    ], function(err){
        debug("格式化队列完成");
    });


}

/*
* 初始化价格数据库
* */
function initPriceData(){
    return fs.readFileSync(PATH.pricedata,'utf8');
}