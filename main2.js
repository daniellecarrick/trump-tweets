// Create data

var margin = { top: 20, right: 20, bottom: 30, left: 30 };
width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom - 200;

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var x = d3.scaleTime()
  .range([0, width]);


var y = d3.scaleLinear()
    .range([height, 0]);

var r = d3.scaleLinear()
    .range([5, 50]);

var color = d3.scaleSequential(d3.interpolateMagma);

var xAxis = d3.axisBottom(x).ticks(12),
    yAxis = d3.axisLeft(y).ticks(12 * height / width);

var brush = d3.brush().extent([
        [0, 0],
        [width, height]
    ]).on("end", brushended),
    idleTimeout,
    idleDelay = 350;

var calculateRadius = function(area) {
    var result = Math.sqrt(area / Math.PI);
    return result;
}

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

var scatter = svg.append("g")
    .attr("id", "scatterplot")
    .attr("clip-path", "url(#clip)");

// parse the given data into something the computer understands
var parseTime = d3.timeParse("%a %b %d %H:%M:%S %Z %Y");

// Now format the date to something people can understand
var formatDate = d3.timeFormat("%B %d, %Y");
var filteredData = [];

d3.csv("tweets.csv", function(error, data) {
    if (error) throw error;

   // var regressionX = [];
   // var regressionY = [];

    data.forEach(function(d) {
        d.created_at = parseTime(d.created_at);
        d.retweet_count = +d.retweet_count;
        d.favorite_count = +d.favorite_count;
        d.total_social = +d.retweet_count + +d.favorite_count;

     //   regressionX.push(d.retweet_count);
     //   regressionY.push(d.favorite_count);
    });

    // See if a tweet is above or below expected
     // findLineByLeastSquares(regressionX, regressionY);


    var xExtent = d3.extent(data, function(d) { return d.created_at; });
    var yExtent = d3.extent(data, function(d) { return d.total_social; });
    x.domain(d3.extent(data, function(d) { return d.created_at; }));
    y.domain(d3.extent(data, function(d) { return d.total_social; })).nice();
    r.domain(d3.extent(data, function(d) { return calculateRadius(d.total_social); }));
    color.domain([d3.max(data, function(d) {
        return d.total_social; }), d3.min(data, function(d) {
        return d.total_social; })]);

    function drawChart(data) {
      var dot = scatter.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return r(calculateRadius(d.total_social)); })
        .attr("cx", function(d) { return x(d.created_at); })
        .attr("cy", function(d) { return y(d.total_social); })
        .attr("opacity", 0.5)
        .style("fill", function(d) {
            return color(d.total_social); });

      dot.on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<span class='date'></span><br/><span class='tweet-text'>" + d.text + "</span><br/>" + "<span class='retweet-stats'>Retweets: " + d.retweet_count + "<br/>" + "Favorites: " + d.favorite_count + "</span>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    }

    drawChart(data);
/// WORK ON THIS AREA
        function filter(data, filterText) {
          data.forEach(function(d) {
            if (d.text.indexOf(filterText) !== -1) {
              filteredData.push(d);
               }
          })
          drawChart(filteredData);
          console.log('filter was clicked');
        };

        d3.select('#fakenews').on('click', function() {
          filter(data, "fake");
        })


}); // end of d3.csv


// x axis
svg.append("g")
    .attr("class", "x axis")
    .attr('id', "axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("text")
    .style("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 8)
    .text("Time");

// y axis
svg.append("g")
    .attr("class", "y axis")
    .attr('id', "axis--y")
    .call(yAxis);

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "1em")
    .style("text-anchor", "end")
    .text("Social Volume");

scatter.append("g")
    .attr("class", "brush")
    .call(brush);

function brushended() {

    var s = d3.event.selection;
    if (!s) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        x.domain(d3.extent(data, function(d) { return d.created_at; })).nice();
        y.domain(d3.extent(data, function(d) { return d.total_social; })).nice();
    } else {

        x.domain([s[0][0], s[1][0]].map(x.invert, x));
        y.domain([s[1][1], s[0][1]].map(y.invert, y));
        scatter.select(".brush").call(brush.move, null);
    }
    zoom();
}

function idled() {
    idleTimeout = null;
}

function zoom() {

    var t = scatter.transition().duration(750);
    svg.select("#axis--x").transition(t).call(xAxis);
    svg.select("#axis--y").transition(t).call(yAxis);
    scatter.selectAll("circle").transition(t)
        .attr("cx", function(d) { return x(d.created_at); })
        .attr("cy", function(d) { return y(d.total_social); });
}