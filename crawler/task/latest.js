/*
 * find the latest news
 *
 * */

var debug = require("debug"),
    database = require("../database/mongo"),
    config = require("config"),
    root = process.cwd(),
    URL = config.get("crawler.url"),
    BASE = config.get("crawler.base"),
    crawler = require(root + "/crawler/app/crawler.js");
log = debug("latest : ");


module.exports.checkUpdate = checkUpdate;


