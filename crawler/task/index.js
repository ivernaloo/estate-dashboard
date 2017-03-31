var debug = require("debug"),
    config = require("config"),
    root = process.cwd(),
    crawler = require(root + "/crawler/db/crawler.js");


var log = debug("crontab");
crawler.init();

