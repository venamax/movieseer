var barchartsvg = d3.select("#mybarchart").append("svg")
    .attr("height",300)
    .attr("width",300);

var timeseriessvg = d3.select("#mytimeseries").append("svg")
    .attr("height",300)
    .attr("width",600);

d3.csv("data/movie_list_d3.csv",function(data) {
    
    console.log(data);

    var rev = data.map(function(d) { return +d.revenues_clean/1000000; }).filter(function(d) { return d < 1000; });
    
    var barx = d3.scaleLinear()
        //.domain(d3.extent(rev))
        .domain([1,1000])
        .rangeRound([40, 300]);

    console.log(d3.extent(rev));

    var bins = d3.histogram()
        .domain(barx.domain())
        .thresholds(barx.ticks(60))
    (rev);

    console.log(bins);

    var bary = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([280, 10]);

    var bar = barchartsvg.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + barx(d.x0) + "," + bary(d.length) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", barx(bins[0].x1) - barx(bins[0].x0) - 1)
        .attr("height", function(d) { return 280 - bary(d.length); })
        .attr("fill","red")
        .on("click",function(d,i) {
            // console.log(d);
            // console.log(i);
            var range = [d.x0,d.x1];
            d3.selectAll("circle").style("visibility","hidden");
            d3.selectAll("circle").filter(function(d,i) {
                return (rev[i] > range[0]) && (rev[i] < range[1]);
            })
                .style("visibility","visible");
        });

    // bar.append("text")
    //     .attr("dy", ".75em")
    //     .attr("y", 6)
    //     .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    //     .attr("text-anchor", "middle")
    //     .text(function(d) { return formatCount(d.length); });

    barchartsvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 280 + ")")
        .call(d3.axisBottom(barx));

    barchartsvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(40," + 00 + ")")
        .call(d3.axisLeft(bary));

 
    //var format = d3.timeFormat("%m-%d-%Y")
    var times = data.filter(function(d) { return d3.isoParse(d.release_date) > d3.isoParse('01-01-2000') &&  d3.isoParse(d.release_date) < d3.isoParse('12-31-2017');}).map(function(d) { return d3.isoParse(d.release_date); });
   console.log(times);

    var timex = d3.scaleLinear()
        //.domain(d3.extent(times))
        .domain([d3.isoParse('01-01-2000'), d3.isoParse('12-31-2016') ])
        .range([40, 600]);

    var timey = d3.scaleLinear()
        .domain(d3.extent(rev))
        .range([280,10]);



    timeseriessvg.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx",function(d,i) { return timex(times[i]); })
        .attr("cy",function(d,i) { return timey(rev[i]); })
        .attr("r",4)
        .attr("fill","red")
        .style("opacity",0.3);

    var tooltip = d3.select("body")
    
    timeseriessvg.selectAll(".circle")
        .data(data)
        .enter()
        .append("text")
        .attr("dx",function(d,i) { return timex(times[i]); })
        .attr("dy",function(d,i) { return timey(rev[i]); })
        .text(function(d) { return d.title_clean })
        .style("visibility","hidden")
        .on("mouseover", function(d)
        {
            d3.select(this).style("visibility","visible")
                })
        .on("mouseout", function(d)
        {
            d3.select(this).style("visibility","hidden")
        })
        .style("visibility","visible")



    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 280 + ")")
        .call(d3.axisBottom(timex).tickFormat(d3.timeFormat("%Y")));

    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(40," + 00 + ")")
        .call(d3.axisLeft(timey));
});
