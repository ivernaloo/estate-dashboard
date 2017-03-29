var debug = require("debug"),
    cron = require('node-cron'),
    crawler = require("../../crawler/db/crawler.js").init,
    format = require("../../crawler/db/transform.js").format;

var log = debug("crontab");

log(crawler)

log(".................")
cron.schedule('* * * * * *', function(){
    console.log("....")
    log('running a task every minute');
});