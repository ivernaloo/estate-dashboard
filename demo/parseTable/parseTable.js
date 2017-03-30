/**
 * converts array-like object to array
 * @param  collection the object to be converted
 * @param  range such as [2,2] to indicate range to cut
 * @return {Array} the converted object
 */
function arrayify(collection, range) {
    var _array = Array.prototype.slice.call(collection);
    if (range) {
        _array = _array.slice(range[0], range[1])
    }
    return _array; // simple convert array-like to array
}

/**
 * generates factory functions to convert table rows to objects,
 * based on the titles in the table's <thead>
 * @param  {Array[String]} headings the values of the table's <thead>
 * @return {Function}      a function that takes a table row and spits out an object
 */
function factory(headings) {
    return function (row) {
        return arrayify(row.cells).reduce(function (prev, curr, i) {
            prev[headings[i]] = curr.innerText;
            return prev;
        }, {});
    }
}

/**
 * given a table, generate an array of objects.
 * each object corresponds to a row in the table.
 * each object's key/value pairs correspond to a column's heading and the row's value for that column
 *
 * @param  {HTMLTableElement} table the table to convert
 * @return {Array[Object]}    array of objects representing each row in the table
 */
function parseTable(table) {
    var headings = [],
        h1s      = arrayify(table.rows[0].cells),
        h2s      = arrayify(table.rows[1].cells); // custom headings

    // custom the title and combine two line to one line title
    h1s.forEach(function (heading, index) {   // get the 1st rows get the column title
        if (index < 1) { // exclude first title
            headings.push(heading.innerText);
            return;
        }
        headings.push(heading.innerText + "-" + h2s[2 * (index - 1)].innerText, heading.innerText + "-" + h2s[2 * index - 1].innerText);
    });

    return arrayify(table.tBodies[0].rows, [2, -2]).map(factory(headings)); // extract the content
}