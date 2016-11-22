var debug = require('debug'),
    fs = require('fs'),
    _ = require("lodash"),
    async = require('async'),
    SG = require('ml-savitzky-golay'),
    PATH = {
        "pricedata" : "./crawler/data/estate.json",
        "data" : "./crawler/data/estate_format.js"
    },
    PRICEDATA = JSON.parse(initPriceData()),
    log;
function smooth (list, degree) {
    var win = degree*2-1;
    weight = _.range(0, win).map(function (x) { return 1.0; });
    weightGauss = [];
    for (i in _.range(0, win)) {
        i = i-degree+1;
        frac = i/win;
        gauss = 1 / Math.exp((4*(frac))*(4*(frac)));
        weightGauss.push(gauss);
    }
    weight = _(weightGauss).zip(weight).map(function (x) { return x[0]*x[1]; });
    smoothed = _.range(0, (list.length+1)-win).map(function (x) { return 0.0; });
    for (i=0; i < smoothed.length; i++) {
        smoothed[i] = _(list.slice(i, i+win)).zip(weight).map(function (x) { return x[0]*x[1]; }).reduce(function (memo, num){ return memo + num; }, 0) / _(weight).reduce(function (memo, num){ return memo + num; }, 0);
    }
    return smoothed;
}
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
                // 去除
                if (parseInt(PRICEDATA[key][1].replace(/\D/g,'')) < 100 ){
                   return;
                }
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
                "time" : TIME,
                "guangu" : smooth(ESTATE_GuanGu),
                "total" : smooth(ESTATE_Total)
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