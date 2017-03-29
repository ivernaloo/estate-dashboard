"use strict";

const RAWDATA = require("../data/estate.json");
const DATA = require("../data/estate_format.js").DATA;
const debug = require('debug');
let log = debug("verify");

function verify(){
    log(Object.keys(RAWDATA).length);   // the length of RAW DATA
    // log(Object.keys(DATA)); // print the source data format: ['time', 'guangu', 'total']
    log(DATA['time'].length,DATA["guangu"].length,DATA["total"].length); // this three object length should be equal
    log("Results Correct? : ", DATA['time'].length == DATA["guangu"].length == DATA["total"].length);
};

module.exports.verify = verify;



