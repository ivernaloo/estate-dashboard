var svg;
//The data for our line
lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
    { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
    { "x": 80,  "y": 5},  { "x": 100, "y": 60}];
var formatDate = d3.time.format("%Y/%m/%d");
var _DATA = DATA.time.map(function(_, idx){
    return { time: idx, guangu: DATA.guangu[idx], total: DATA.total[idx]}
});
var x = d3.time.scale().domain([minDate, maxDate]).range([0, DATA.time.length]);

// helper function
function getDate(d) {
    return new Date(d.time);
}
var _x = Array.apply(null, new Array(DATA.time.length)).map(function (_, i) {return i;});

console.log(_x)
// get max and min dates - this assumes data is sorted
var minDate = getDate(_DATA[0]),
    maxDate = getDate(_DATA[_DATA.length-1]);

console.log(_DATA);
//This is the accessor function we talked about above
var lineFunction = d3.svg.line()
    .x(function(d) { return d.time; })
    .y(function(d) { return d.guangu; })
    .interpolate("cardinal"); // Linear / step-before / step-after / basis /  basis-open / basis-close /
                                 // bundle / cardinal / cardinal-open / cardinal-closed / monotone


//The SVG Container
var svgContainer = d3.select("body").append("svg:svg")
    .attr("width", 900)
    .attr("height", 900);

//The line SVG Path we draw
var lineGraph = svgContainer.append("path")
    .attr("d", lineFunction(_DATA))
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .attr("fill", "none");