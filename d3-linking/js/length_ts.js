
//// Size of charts
var bar_height = 600
var bar_width = 600
var ts_height = 600
var ts_width = 600

//// First chart: Bar Chart Box Office Histogram
///  Second chart : Timeline of movie release showing profitability

/// Set size of charts
var barchartsvg = d3.select("#mybarchart").append("svg")
    .attr("height",bar_height)
    .attr("width",bar_width);
var timeseriessvg = d3.select("#mytimeseries").append("svg")
    .attr("height",ts_height)
    .attr("width",ts_width);


//// Access data from csv file
d3.csv("data/feature_d3.csv",function(data) {
    
    //console.log(data);

////  Bar Chart /////////////////////////////////
    //// filter data to inlude movies with less than 1.5 billion in reveues and release after 1999
    var filtered_data = data.filter(function(d) { return (+d.revenues_clean/1000000) > 0; })
                   .filter(function(d) { return d3.isoParse(d.release_date) > d3.isoParse('01-01-2000')})
                    .filter(function(d){return +d.length_clean > 60 &&  +d.length_clean < 240}); 
              
    //// Box Office in millions of USD
    var rev =  filtered_data.map(function(d) { return +d.length_clean; })
    console.log(rev)


    //// match values to x position
    var barx = d3.scaleLinear()
        .domain(d3.extent(rev))
        //.domain([1,56])
        //.rangeRound([40, 300]);
        .rangeRound([80, bar_width]);

    //console.log(d3.extent(rev));

    /// define bins in histogram chart. St up to create a bin every 50 million USD
    var bins = d3.histogram()
        .domain(barx.domain())
        .thresholds(barx.ticks(20))
    (rev);
    //console.log(bins);

    /// match values to y position
    var bary = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        //.range([280, 10]);
        .range([bar_height-40, 10]);
    

    //// Render Bar Chart
    var bar = barchartsvg.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + barx(d.x0) + "," + bary(d.length) + ")"; });
    bar.append("rect")
        .attr("x", 1)
        .attr("width", barx(bins[0].x1) - barx(bins[0].x0) - 1)
        .attr("height", function(d) { return bar_height-40 - bary(d.length); })
        .attr("fill", function(d) { return "rgb(0, 0, " + (d.length * 10) + ")"})
        .on("click",function(d,i) { 
            // console.log(d);
            // console.log(i);
            d3.selectAll("rect").attr("fill",function(d) { return "rgb(0, 0, " + (d.length * 10) + ")"});
            d3.select(this).attr("fill", "orange");
            var range = [d.x0,d.x1];
            d3.selectAll("circle").style("visibility","hidden");
            d3.selectAll("circle").filter(function(d,i) {
                return (rev[i] > range[0]) && (rev[i] < range[1]);
            }).style("visibility","visible");
        });

    // bar.append("text")
    //     .attr("dy", ".75em")
    //     .attr("y", 6)
    //     .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    //     .attr("text-anchor", "middle")
    //     .text(function(d) { return formatCount(d.length); });


    /// Render axis for bar chart
    barchartsvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 560 + ")")
        .call(d3.axisBottom(barx));
    barchartsvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(80," + 00 + ")")
        .call(d3.axisLeft(bary));

    /// Render axis labels
    barchartsvg.append("text")
            .attr("class", "y label")
            .text("Number of movies")
            .attr("x", -300)
            .attr("y",20)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("transform", "rotate(-90)")
            .attr("fill", "gray");     
    barchartsvg.append("text")
            .attr("class", "x label")
            .text("Lenght of movie in minutes")
            .attr("x", 500)
            .attr("y",600)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("fill", "gray");  

 ///// Time Series Chart /////
    //var format = d3.timeFormat("%m-%d-%Y")

    /// Time Format
    var times = filtered_data.map(function(d) { return d3.isoParse(d.release_date); });
    ///console.log(times);

    //// match values to x position in timeseries chart
    var timex = d3.scaleLinear()
        //.domain(d3.extent(times))
        .domain([d3.isoParse('01-01-1999'), d3.isoParse('12-31-2017') ])
        .range([80, 600]);

    /// match values to y position in timeseries chart
    var timey = d3.scaleLinear()
        //.domain(d3.extent(rev))
        .domain([-200,800])
        .range([560,10]);

    /// Define label variables
    var profit_color = filtered_data.map(function(d){if (+d.profit_class > 0){return "green"} else {return "red"} });
    var text_pos = filtered_data.map(function(d){if (d3.isoParse(d.release_date) > d3.isoParse('01-01-2009')){return "end"} else {return "start"} });
    var formatPercent = d3.format(",.0%");
    var site = filtered_data.map(function(d){return d.site});
    var return_label = filtered_data.map(function(d){ return "ROI = "+ formatPercent(d.return)});
    var profit = filtered_data.map(function(d){ return +d.gross_profit/1000000});
    var x_pos_1 = filtered_data.map(function(d){if(+d.profit_class >0){return 70} else {return -70}})
    var x_pos_2 = filtered_data.map(function(d){if(+d.profit_class >0){return 50} else {return -90}})
    ///console.log(site)
    
    /// Render timeseries chart
    timeseriessvg.selectAll(".circle")
        .data(filtered_data)
        .enter()
        .append("circle")
        .attr("cx",function(d,i) { return timex(times[i]); })
        .attr("cy",function(d,i) { return timey(profit[i]); })
        .attr("r",4)
        .attr("fill", function(d,i) { return profit_color[i] })
        .style("opacity",0.3)
        .on("click", function(d,i) { window.open(site[i]);}) // when clicked, opens window with google.com.
        .on("mouseover", function(d,i) {
    //Create the tooltip label
    timeseriessvg.append("text")
            .attr("id", "tooltip1")
            .text(d.title_clean)
            .attr("dx",timex(times[i]))
            .attr("dy",timey(profit[i]+x_pos_1[i]))
            .attr("text-anchor", text_pos[i])
            .attr("font-family", "sans-serif")
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .attr("fill", "black");
    timeseriessvg.append("text")
            .attr("id", "tooltip2")            
            .text(return_label[i])
            .attr("dx",timex(times[i]))
            .attr("dy",timey(profit[i]+x_pos_2[i]))
            .attr("text-anchor", text_pos[i])
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

    //// Label axis
    timeseriessvg.append("text")
            .attr("class", "y label")
            .text("Gross Profit from Box Office in Millions of USD (not including Marketing Expense)")
            .attr("x", -300)
            .attr("y",40)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("transform", "rotate(-90)")
            .attr("fill", "gray");          
    timeseriessvg.append("text")
            .attr("class", "x label")
            .text("Year of Realease")
            .attr("x", 500)
            .attr("y",600)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("fill", "gray");  
    /// Label Legend for Profitability
    timeseriessvg.append("ellipse")  ///legend
                .attr("id", "legend")
                .attr("cx",100)
                .attr("cy", 10)
                .attr("rx",5)
                .attr("ry",5)
                .attr("fill", "green")
                .style("opacity",0.3)
    timeseriessvg.append("text")  ///legend
                .text("Profitable")
                .attr("x",110)
                .attr("y", 15)
                .attr("fill", "green")
                .attr("text-anchor", "start")
                .attr("font-family", "sans-serif")
                .attr("font-size", "12px")
    timeseriessvg.append("ellipse")  ///legend
                .attr("id", "legend")
                .attr("cx",100)
                .attr("cy", 30)
                .attr("rx",5)
                .attr("ry",5)
                .attr("fill", "red")
                .style("opacity",0.3)
    timeseriessvg.append("text")  ///legend
                .text("Not Profitable")
                .attr("x",110)
                .attr("y", 35)
                .attr("fill", "red")
                .attr("text-anchor", "start")
                .attr("font-family", "sans-serif")
                .attr("font-size", "12px")

    /// Render axis
    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + 560 + ")")
        .call(d3.axisBottom(timex).tickFormat(d3.timeFormat("%Y")));
    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(80," + 00 + ")")
        .call(d3.axisLeft(timey));})

