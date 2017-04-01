var cheerio = require('cheerio'),
    parse   = require('cheerio-tableparser');

$ = cheerio.load('<table></table>');

parse($);
data = $("table").parsetable();
console.log(data);
