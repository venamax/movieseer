var barchartsvg = d3.select("#mybarchart").append("svg")
    .attr("height",300)
    .attr("width",300);

var timeseriessvg = d3.select("#mytimeseries").append("svg")
    .attr("height",300)
    .attr("width",600);

d3.csv("data/movie_list_d3.csv",function(data) {
    
    console.log(data);

    var filtered_data = data.filter(function(d) { return (+d.revenues_clean/1000000) < 1500; })
                   .filter(function(d) { return d3.isoParse(d.release_date) > d3.isoParse('01-01-2000'); })
              

    var rev =  filtered_data.map(function(d) { return +d.revenues_clean/1000000; })

    
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
        .attr("fill", function(d) { return "rgb(0, 0, " + (d.length * 10) + ")"})
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
    var times = filtered_data.map(function(d) { return d3.isoParse(d.release_date); });
   console.log(times);

    var timex = d3.scaleLinear()
        //.domain(d3.extent(times))
        .domain([d3.isoParse('01-01-1999'), d3.isoParse('12-31-2017') ])
        .range([40, 600]);

    var timey = d3.scaleLinear()
        .domain(d3.extent(rev))
        .range([280,10]);


    var profit_color = filtered_data.map(function(d){if (+d.profit_class > 0){return "green"} else {return "red"} });
    var formatPercent = d3.format(",.0%")
    var return_label = filtered_data.map(function(d){ return "ROI = "+ formatPercent(d.return)});
    console.log(profit_color[0].toString())
    timeseriessvg.selectAll(".circle")
        .data(filtered_data)
        .enter()
        .append("circle")
        .attr("cx",function(d,i) { return timex(times[i]); })
        .attr("cy",function(d,i) { return timey(rev[i]); })
        .attr("r",4)
        .attr("fill", function(d,i) { return profit_color[i] })
        .style("opacity",0.3)
        .on("mouseover", function(d,i) {
//Create the tooltip label
        timeseriessvg.append("text")
            .attr("id", "tooltip1")
            .text(d.title_clean)
            .attr("dx",timex(times[i]))
            .attr("dy",timey(rev[i]+200))
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");
        timeseriessvg.append("text")
            .attr("id", "tooltip2")            
            .text(return_label[i])
            .attr("dx",timex(times[i]))
            .attr("dy",timey(rev[i]+120))
            .attr("text-anchor", "end")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-style", "italic")
            .attr("fill", profit_color[i])


            ;
        })
        .on("mouseout", function() {
//Remove the tooltip
            d3.select("#tooltip1").remove();
            d3.select("#tooltip2").remove();

        })


    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 280 + ")")
        .call(d3.axisBottom(timex).tickFormat(d3.timeFormat("%Y")));

    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(40," + 00 + ")")
        .call(d3.axisLeft(timey));})
