$.getJSON('../data/v1.json', function(data) {
    data = _.without(data, null);
    var stackData = _.unzip(_.map(data, function(o, i) {
	if (!o) return;
	var m = {gender: "male", x: i+2001, y: Number(o["Full-Time Male enrollment, Undergraduate, 1st time Freshman"])};
	var f = {gender: "female", x: i+2001, y: Number(o["Full-Time Female enrollment, Undergraduate, 1st time Freshman"])};
	m.total = f.total = m.y+f.y;
	return [m, f];
    }));

    doD3(stackData);
});

function doD3(data) {

    var n = 2, // number of layers
	m = 15, // number of samples per layer
	layers = d3.layout.stack()(data),
	paddingLeft = 80,
	paddingBottom = 50;

    var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
	yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

    var margin = {top: 30, right: 10, bottom: 20, left: 10},
	width = 960 - margin.left - margin.right,
	height = 420 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
	.domain(d3.range(2001, 2016))
	.rangeRoundBands([paddingLeft, width], .02);

    var y = d3.scale.linear()
	.domain([0, yStackMax])
	.range([height-paddingBottom, 0]);

    var color = d3.scale.linear()
	.domain([0, n - 1])
	.range(["#d62728", "#1f77b4"]);

    var xAxis = d3.svg.axis()
	.scale(x)
	.tickSize(0)
	.tickPadding(6)
	.orient("bottom");

    var yAxis = d3.svg.axis()
	.scale(y)
	.tickSize(0)
	.tickPadding(6)
	.orient("left")

    var svgWidth= width + margin.left + margin.right;
    var svgHeight= height + margin.top + margin.bottom;
    var svg = d3.select("body").append("svg")
	.attr("width", "100%")
	.attr("viewBox", "0 0 "+svgWidth+" "+svgHeight)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var layer = svg.selectAll(".layer")
	.data(layers)
	.enter().append("g")
	.attr("class", "layer")
	.style("fill", function(d, i) { return color(i); });

    var rect = layer.selectAll("rect")
	.data(function(d) { return d; })
	.enter().append("rect")
	.attr("x", function(d) { return x(d.x); })
	.attr("y", height)
	.attr("width", x.rangeBand())
	.attr("height", 0);

    rect.transition()
	.delay(function(d, i) { return i * 10; })
	.attr("y", function(d) { return y(d.y0 + d.y); })
	.attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

    var xAxisG = svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + (height-paddingBottom) + ")")
	.call(xAxis);

    var yAxisG = svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate("+paddingLeft+", 0)")
	.call(yAxis);

    // X axis label
    svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "middle")
	.attr("x", width/2)
	.attr("y", height)
	.text("Year of enrollment");
    
    // Y axis label
    svg.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "end")
	.attr("y", 6)
	.attr("x", -height/3)
	.attr("dy", "0.75em")
	.attr("transform", "rotate(-90)")
	.text("Number of students enrolled");


    var legend = svg.append("g")
	.attr("class", "legend")
	.attr('transform', 'translate('+(width-200)+','+(height-15)+')')
	.attr("width", 160)
	.attr("height", 35);

    // border
    legend.append("rect")
	.attr("height", 35)
	.attr("width", 160)
    	.style("stroke", "black")
    	.style("stroke-width", "0.5px")
	.style("fill", "none");

    
    // males
    legend.append("rect")
	.attr('x', 10)
	.attr('y', 10)
	.attr("width", 15)
	.attr("height", 15)
	.style("fill", function(d) { return color(0) });
    ;
    legend.append("text")
	.attr("x", 30)
	.attr("y", 22)
	.attr("text-anchor", "left")
	.text("Male");

    // females
    legend.append("rect")
	.attr("x", 80)
	.attr("y", 10)
	.attr("width", 15)
	.attr("height", 15)
	.style("fill", function(d) { return color(1) });
    legend.append("text")
	.attr("x", 100)
	.attr("y", 22)
	.attr("text-anchor", "left")
	.text("Female");

    
    d3.selectAll("input").on("change", change);

    // hover text
    rect.append("svg:title")
	.text(function(d) {
	    if (!d) return;
	    console.log(d);
	    var pronoun = d.gender == "male" ? "men" : "women";
	    return d.y + " " + pronoun + " were enrolled in " + (d.x-1) + "-" + d.x + ";\n" + d.total + " students in total.";
	});
    
    var timeout = setTimeout(function() {
	d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    }, 2000);

    function change() {
	clearTimeout(timeout);
	if (this.value === "grouped") transitionGrouped();
	else transitionStacked();
    }

    function transitionGrouped() {
	y.domain([0, yGroupMax]);
	yAxis.scale(y)
	    .ticks(7);
	yAxisG.transition()
	    .delay(500)
	    .duration(700)
	    .call(yAxis);

	rect.transition()
	    .duration(500)
	    .delay(function(d, i) { return i * 10; })
	    .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
	    .attr("width", x.rangeBand() / n)
	    .transition()
	    .attr("y", function(d) { return y(d.y); })
	    .attr("height", function(d) { return height - y(d.y) - paddingBottom; });
    }

    function transitionStacked() {
	y.domain([0, yStackMax]);
	yAxis.scale(y)
	    .ticks(10);
	yAxisG.transition()
	    .delay(500)
	    .duration(700)
	    .call(yAxis);

	rect.transition()
	    .duration(500)
	    .delay(function(d, i) { return i * 10; })
	    .attr("y", function(d) { return y(d.y0 + d.y); })
	    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	    .transition()
	    .attr("x", function(d) { return x(d.x); })
	    .attr("width", x.rangeBand());
    }
};
