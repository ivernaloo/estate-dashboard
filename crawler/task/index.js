var debug = require("debug"),
    cron = require('node-cron'),
    crawler = require("../../crawler/db/crawler.js").init,
    format = require("../../crawler/db/transform.js").format;

var log = debug("crontab");

log(crawler)
log(format)

log(".................")
cron.schedule('*/10 * * * * *', function(){
    console.log("....")
    // crawler(format);
    log('running a task every minute');
});