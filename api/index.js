/*
* provide api service for web
* 2017-04-15
* */

var debug = require('debug'),
    log = debug("API : "),
    config   = require("config"),
    root     = process.cwd(),
    database = require(root + "/crawler/database/mongo");


// database.buildDistrictCollection();
database.queryDistrict();

log("START...");

