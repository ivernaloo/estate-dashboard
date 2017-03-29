var debug = require("debug"),
    cron = require('node-cron'),
    crawler = require("../../crawler/db/crawler.js").init,
    format = require("../../crawler/db/transform.js").format;

var log = debug("crontab");

log(".................")
cron.schedule('* * */12 * * *', function(){
    console.log("start a new crawler");
    crawler(format);
    log('running a task every minute');
});