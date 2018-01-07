var margin = { top: 20, right: 20, bottom: 30, left: 50 };
width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom - 200;

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var r = d3.scaleLinear()
    .range([3, 30]);

var color = d3.scaleSequential(d3.interpolateMagma);

// parse the given data into something the computer understands
var parseTime = d3.timeParse("%_m/%_d/%y %H:%M");

// Now format the date to something people can understand
var formatDate = d3.timeFormat("%b %d");

var xAxis = d3.axisBottom(x)
    .ticks(12)
    .tickFormat(formatDate);

var yAxis = d3.axisRight(y)
    .tickSize(width)
    .tickFormat(d3.format('.0s'));
// .ticks(12 * height / width);

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
    .attr("width", width)
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

var filteredData = [];

/*** TOOLTIP ***/

tip = d3.tip()
    .html(function(d) {
        /*return d.text, d.retweet_count, d.favorite_count;*/
        return d.text + '<br />' + formatDate(d.created_at);
    })
    .attr('class', 'd3-tip')
    .direction(function(d) {
        if (d.created_at < 1488344400000) { // equivalent to March 2017
            return 'e';
        } else if (d.created_at > 1513314000000) { // equivalent to Dec 15 2017
            return 'w';
        } else {
            return 'n';
        }
    })
    .offset([0, 3])

svg.call(tip);


/*************
Where the magic happens
**************/

d3.csv("tweets.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        d.created_at = parseTime(d.created_at);
        //console.log(d.created_at);
        d.retweet_count = +d.retweet_count;
        d.favorite_count = +d.favorite_count;
        d.total_social = +d.retweet_count + +d.favorite_count;
    });

    var xExtent = d3.extent(data, function(d) { return d.created_at; });
    var yExtent = d3.extent(data, function(d) { return d.total_social; });
    x.domain([new Date('2016', '11', '20'), new Date('2018', '01', '20')]);
    y.domain(yExtent).nice();
    r.domain(d3.extent(data, function(d) { return calculateRadius(d.total_social); }));
    color.domain([d3.max(data, function(d) {
        return d.total_social;
    }), d3.min(data, function(d) {
        return d.total_social;
    })]);

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
        .text("Date");

    // y axis
    svg.append("g")
        .call(customYAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -20)
        .attr("dy", "1em")
        .attr('class', 'axis-label')
        .style("text-anchor", "end")
        .text("Retweets and Favorites");


    function drawChart(data, filter) {
        console.log('filter is', filter);

        var dot = scatter.selectAll(".dot")
            .data(data)
            .enter().append("circle") //.filter(function(d) { if (filtering(d.text, filter)) {return d.text}})
            .attr("class", "dot")
            .attr("r", function(d) { return r(calculateRadius(d.total_social)); })
            // .attr("r", 2)

            .attr("cx", function(d) { return x(d.created_at); })
            .attr("cy", function(d) { return y(d.total_social); })
            //    .attr("cy", function(d) { return y(d.favorite_count); })
            .attr("opacity", 0.5)
            .style("fill", function(d) {
                return color(d.total_social)
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }
    var filter = ' ';
    drawChart(data, filter);

    /// WORK ON THIS AREA
    function filtering(str, items) {
        for (var i in items) {
            var item = items[i];
            if (str.indexOf(item) > -1) {
                return true;
            }
        }
        return false;
    }

}); // end of d3.csv


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

function customYAxis(g) {
    g.attr("class", "y axis")
    g.attr('id', "axis--y")
    g.call(yAxis);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#999").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
}

function zoom() {

    var t = scatter.transition().duration(750);
    svg.select("#axis--x").transition(t).call(xAxis);
    svg.select("#axis--y").transition(t).call(customYAxis);
    scatter.selectAll("circle").transition(t)
        .attr("cx", function(d) { return x(d.created_at); })
        .attr("cy", function(d) { return y(d.total_social); });
}

d3.select('button').on('click', function() {
    filter = this.value;
    console.log('filter is', filter);
    drawChart(data, filter);
})