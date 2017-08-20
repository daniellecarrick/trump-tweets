// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = window.innerWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%a %b %d %H:%M:%S %Z %Y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var r = d3.scaleLinear().range([5,100]);


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("tweets.csv", function(error, data) {
  if (error) throw error;

  // format the data
  data.forEach(function(d) {
      d.created_at = parseTime(d.created_at);
      d.retweet_count = +d.retweet_count;
      d.favorite_count = +d.favorite_count;
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.created_at; }));
  y.domain([0, d3.max(data, function(d) { return d.retweet_count; })]);
  r.domain(d3.extent(data, function(d) { return d.favorite_count; }));

  // Add the scatterplot
  svg.selectAll("dot")
      .data(data)
    .enter().append("circle")
      .attr("r", function(d) { return r(d.favorite_count); })
      .attr("cx", function(d) { return x(d.created_at); })
      .attr("cy", function(d) { return y(d.retweet_count); });

  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

});
