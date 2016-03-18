// partially adapted from http://bl.ocks.org/benvandyke/8459843

var margin = {left: 10, top: 10, right: 10, bottom : 10},
    padding = {left: 70, bottom: 50, right: 30, top: 0},
    width= 960,
    height= 420;

var svg = d3.select('body')
    .append('svg')
    .attr("width", "100%")
    .attr("viewBox", "0 0 "+(width)+" "+(height))
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "y axis");

svg.append("g")
    .attr("class", "x axis");

var xScale = d3.scale.ordinal()
    .domain(d3.range(2000, 2011))
    .rangeRoundPoints([padding.left, width-padding.right], .1);

var yScale = d3.scale.linear()
    .domain([0.3,0.7])
    .range([height-padding.bottom, padding.top]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .tickFormat(d3.format('%'))
    .orient("left");


d3.csv("../data/v2.csv", function(data) {
    data = _.last(data, 9);
    console.log(data);
    var xyTensor = _.unzip(data.map(function(d) { return [d['Year To'], d['Sub-six-year graduation rate']]; })),
	x = xyTensor[0],
	y = xyTensor[1];
    console.log(x,y);
    
    var line = d3.svg.line()
	.x(function(d) { return xScale(Number(d['Year To'])); })
	.y(function(d) { return yScale(Number(d['Sub-six-year graduation rate'])); });

    svg.append("path")
	.datum(data)
	.attr("class","line")
	.attr("d", line);

    svg.select('.x.axis')
	.attr("transform", "translate(0," + (height-padding.bottom) + ")")
	.call(xAxis);
    
    svg.select('.y.axis')
	.attr("transform", "translate("+(padding.left)+","+(-0)+")")
	.call(yAxis);

    svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("cx", line.x())
	.attr("cy", line.y())
	.attr("r", 3.5)
	.append('title')
	.text(function(d) {
	    return d3.format('%')(d['Sub-six-year graduation rate']) + " of the students who started in " +
		(d['Year To']) + " graduated within 6 years";
	});
    ;
    

    // x axis label
    svg.append("text")
	.attr("x", (width + (margin.left + margin.right) )/ 2)
	.attr("y", height - margin.bottom)
	.attr("class", "text-label")
	.attr("text-anchor", "middle")
	.text("Year of first enrollment");

    // y axis label
    svg.append("text")
	.attr("x", (-height+padding.bottom)/2)
	.attr("y", 15)
	.attr("class", "text-label")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("% of undergraduate students who graduate within 6 years")

    
    // apply the reults of the least squares regression
    var lsCoeff = leastSquares(x, y);
    console.log(lsCoeff);
    var x1 = x[0];
    var y1 = lsCoeff[0]*x1 + lsCoeff[1];
    var x2 = x[x.length - 1];
    var y2 = lsCoeff[0] * x2 + lsCoeff[1];
    var trendData = [[x1,y1,x2,y2]];
    
    var trendline = svg.selectAll(".trendline")
	.data(trendData);
    
    trendline.enter()
	.append("line")
	.attr("class", "trendline")
	.attr("x1", function(d) { return xScale(d[0]); })
	.attr("y1", function(d) { return yScale(d[1]); })
	.attr("x2", function(d) { return xScale(d[2]); })
	.attr("y2", function(d) { return yScale(d[3]); })


    var decimalFormat = d3.format("0.2f");
    
    // equation & r^2
    var eq = svg.append('g')
	.attr("class", "eq")
	.attr('transform', 'translate('+(width-200)+','+(height/2)+')');
    
    eq.append("text")
	.text("eq: " + decimalFormat(lsCoeff[0]) + "x + " + 
	      decimalFormat(lsCoeff[1]))
	.attr("class", "text-label")
    
    // display r-square on the chart
    eq.append("text")
	.text("r-sq: " + decimalFormat(lsCoeff[2]))
	.attr("class", "text-label")
	.attr("y", 20);    
});

// returns slope, intercept and r-square of the line
function leastSquares(x, y) {
    var sum = function(prev, cur) { return Number(prev) + Number(cur); };
    
    var xBar = _.reduce(x, sum) / x.length;
    var yBar = _.reduce(y, sum) / y.length;

    console.log(xBar, yBar);
    
    var ssXX = x.map(function(d) { return Math.pow(d - xBar, 2); })
	.reduce(sum);
    
    var ssYY = y.map(function(d) { return Math.pow(d - yBar, 2); })
	.reduce(sum);
    
    var ssXY = x.map(function(d, i) { return (d - xBar) * (y[i] - yBar); })
	.reduce(sum);
    
    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
    
    return [slope, intercept, rSquare];
}
