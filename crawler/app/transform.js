var debug = require('debug'),
    fs = require('fs'),
    async = require('async'),
    SG = require('ml-savitzky-golay'),
    PATH = {
        "pricedata" : "./crawler/data/estate.json",
        "data" : "./crawler/data/estate_format.js"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log;

function format(){
    var TIME = [],
        ESTATE_GuanGu = [],
        ESTATE_Total = [],
        RESULTS = {},
        NEWTIME = [];

    log = debug("format");

    async.series([
        function(done){

            TIME =
                    Object.keys(PRICEDATA).sort(function(a, b) {
                        return new Date(a) - new Date(b);
                    });

            TIME.forEach(function(key, index){
                // 去除
                if (parseInt(PRICEDATA[key][1].replace(/\D/g,'')) < 100 ){
                   return;
                }
                NEWTIME.push(key);
                ESTATE_GuanGu.push(parseInt(PRICEDATA[key][0].replace(/\D/g,'')))
                ESTATE_Total.push(parseInt(PRICEDATA[key][1].replace(/\D/g,'')))
              });

           //卷积算法来平滑曲线
           function smooth(array){
                return SG(array, 1, {
                    windowSize: 241,
                    derivative: 0,
                    pad: 'pre',
                    padValue: 'replicate'
                })
            }

            RESULTS = {
                "time" : NEWTIME,
                "guangu" : smooth(ESTATE_GuanGu),
                "total" : smooth(ESTATE_Total)
            };

            done();        },

        function(done){
            fs.writeFile(PATH.data, "var DATA = " + JSON.stringify(RESULTS), function (err) {
                if (err) throw err;
                console.log('存储格式化了所有数据');
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

module.exports.format = format;