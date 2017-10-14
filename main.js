// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom -100;

// parse the given data into something the computer understands
var parseTime = d3.timeParse("%a %b %d %H:%M:%S %Z %Y");

// Now format the date to something people can understand
var formatDate = d3.timeFormat("%B %d, %Y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var r = d3.scaleLinear().range([5, 50]);
var color = d3.scaleSequential(d3.interpolateMagma);


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#scatterplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var container = svg.append("g");

var zoom = d3.zoom()
    .scaleExtent([1, 40])
    //.translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var calculateRadius = function(area) {
    var result = Math.sqrt(area/Math.PI);
    //console.log(result);
    return result;
}

// Get the data
d3.csv("tweets.csv", function(error, data) {
    if (error) throw error;
   // var filter = "fake news";
    // format the data
    data.forEach(function(d) {
        d.created_at = parseTime(d.created_at);
        d.retweet_count = +d.retweet_count;
        d.favorite_count = +d.favorite_count;
        d.total_social = +d.retweet_count + +d.favorite_count;
        console.log(d.total_social);
        if (d.text.indexOf(filter) !== -1) {
        console.log(d.text);
    }

    });

    var filter = function() {
        for(d of data) {
            if (d.text.indexOf("fake news") !== -1) {
                 console.log(d.text)
            }
        }
    }


    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
        return d.created_at; }));
    y.domain([0, d3.max(data, function(d) { return d.total_social; })]);
    r.domain(d3.extent(data, function(d) {
        return calculateRadius(d.favorite_count + d.retweet_count); }));
    //r.range([50,1000]);
    color.domain([d3.max(data, function(d) {
        return d.total_social; }), d3.min(data, function(d) {
        return d.total_social; })]);

    // Add the scatterplot
   container.selectAll("dot")
        .data(data)
       // .filter(function(d) { if (d.text.indexOf("fake news") !== -1) {return d}  })
        .enter().append("circle")
        .attr("r", function(d) {
            return r(calculateRadius(d.total_social)); })
        .attr("cx", function(d) {
            return x(d.created_at); })
        .attr("cy", function(d) {
            return y(d.total_social); })
        .attr("class", "bubble")
        .style("fill", function(d) {
            return color(d.total_social); })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<span class='date'>" + formatDate(d.created_at) + "</span><br/><span class='tweet-text'>" + d.text + "</span><br/>" + "<span class='retweet-stats'>Retweets: " + d.retweet_count + "<br/>" + "Favorites: " + d.favorite_count + "</span>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    /*  // Add the X Axis
      container.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      // Add the Y Axis
      container.append("g")
          .call(d3.axisLeft(y));*/

});

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);
/*    .ticks(10)
    .tickSize(width)
    .tickPadding(8 - width);*/

/*var view = svg.append("rect")
    .attr("class", "view")
    .attr("x", 0.5)
    .attr("y", 0.5)
    .attr("width", width - 1)
    .attr("height", height - 1);*/

var gX = svg.append("g")
    .attr("class", "axis axis--x")
    .call(xAxis)
    .attr("transform", "translate(0," + height + ")");

var gY = svg.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

svg.call(zoom);

function zoomed() {
    //d3.selectAll('.bubble').attr("transform", d3.event.transform);
   // gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
}
