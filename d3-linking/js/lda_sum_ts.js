
//// Size of charts
var bar_height = 600
var bar_width = 600
var ts_height = 600
var ts_width = 600
var formatPercent = d3.format(",.0%")
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
d3.csv("data/feature_sum_d3.csv",function(data) {
    
    console.log(data);

////  Bar Chart /////////////////////////////////
    //// filter data to inlude movies with less than 1.5 billion in reveues and release after 1999
    ///var filtered_data = data.filter(function(d) { return +d.return; })
                              
    //// Box Office in millions of USD
    var names = data.map(function(d) { return "Cluster "+ d.number_topic; });
    var roi =  data.map(function(d) { return +d.return; });

    //// match values to x position
    var barx = d3.scaleLinear()
        //.domain(d3.extent(rev))
        .domain([-1,4.7])
        //.rangeRound([40, 300]);
        .rangeRound([80, bar_width]);

    //console.log(d3.extent(rev));

    /// define bins in histogram chart. St up to create a bin every 50 million USD
    var bins = d3.histogram()
        .domain(barx.domain())
        .thresholds(barx.ticks(36))
    (roi);
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
                return (roi[i] > range[0]) && (roi[i] < range[1]);
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
        .call(d3.axisBottom(barx)
        .tickFormat(d3.format(".0%")));;
    barchartsvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(80," + 00 + ")")
        .call(d3.axisLeft(bary));

    /// Render axis labels
    barchartsvg.append("text")
            .attr("class", "y label")
            .text("Number of clusters of movies")
            .attr("x", -300)
            .attr("y",20)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("transform", "rotate(-90)")
            .attr("fill", "gray");     
    barchartsvg.append("text")
            .attr("class", "x label")
            .text("Aggregate gross return on investment on movies within each custer")
            .attr("x", 400)
            .attr("y",595)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("fill", "gray");  

 ///// Time Series Chart /////
    //var format = d3.timeFormat("%m-%d-%Y")

    /// Counts
    var counts = data.map(function(d) { return +d.total_profit/+d.count/1000000; }); 
    var real_counts = data.map(function(d) { return +d.count; });
    var profit = data.map(function(d) { return +d.total_rev/+d.count/1000000; }); ///actually it's avg revenue of movie in cluster
    console.log(counts);

    //// match values to x position in timeseries chart
    var timex = d3.scaleLinear()
        //.domain(d3.extent(times))
        .domain([-100,310])
        .range([80, 600]);

    /// match values to y position in timeseries chart
    var timey = d3.scaleLinear()
        //.domain(d3.extent(profit))
        .domain([0,830])
        .range([560,10]);

    /// Define label variables
    var profit_color = data.map(function(d){if (+d.return > 0){return "green"} else {return "red"} });
    var text_pos = data.map(function(d,i){if (counts[i]> 100 ){return "end"} else {return "start"} });
    var formatPercent = d3.format(",.0%");
    var profit_label = data.map(function(d,i) { return "$" + d3.format(",.0f")(profit[i]); } );
    //var site = filtered_data.map(function(d){return d.site})
    var return_label = data.map(function(d,i){ return "ROI = " + formatPercent(roi[i])});
    var titles = data.map(function(d,i){ return d.title_names})
    var x_pos = data.map(function(d,i){if(counts[i] >100){return -10} else {return +10}})
    //console.log(titles)
    
    /// Render timeseries chart
    timeseriessvg.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx",function(d,i) { return timex(counts[i]); })
        .attr("cy",function(d,i) { return timey(profit[i]); })
        .attr("r",4)
        .attr("fill", function(d,i) { return profit_color[i] })
        .style("opacity",0.3)
        //.on("click", function(d,i) { window.open(site[i]);}) // when clicked, opens window with google.com.
        .on("mouseover", function(d,i) {
    //Create the tooltip label
    timeseriessvg.append("text")
            .attr("id", "tooltip1")
            .text(names[i])
            .attr("dx",timex(counts[i]))
            .attr("dy",timey(profit[i]+60))
            .attr("text-anchor", text_pos[i])
            .attr("font-family", "sans-serif")
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .attr("fill", "black");
    timeseriessvg.append("text")
            .attr("id", "tooltip2")            
            .text(return_label[i])
            .attr("dx",timex(counts[i]))
            .attr("dy",timey(profit[i]+20))
            .attr("text-anchor", text_pos[i])
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-style", "italic")
            .attr("fill", profit_color[i])
            ;
    timeseriessvg.append("text")
            .attr("id", "tooltip23")            
            .text("Number of movies: " + real_counts[i])
            .attr("dx",timex(counts[i]))
            .attr("dy",timey(profit[i]+40))
            .attr("text-anchor", text_pos[i])
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-style", "italic")
            .attr("fill", profit_color[i])
            ;

    var title_list = titles[i].split('**');
    var j = 17;

  
        timeseriessvg.append("text")
                .attr("id", "tooltip3")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[0])
                .attr("dy",timey(profit[i]-j) );

        timeseriessvg.append("text")
                .attr("id", "tooltip4")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[1])
                .attr("dy",timey(profit[i]-j*2) );

        timeseriessvg.append("text")
                .attr("id", "tooltip5")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[2])
                .attr("dy",timey(profit[i]-j*3) );


        timeseriessvg.append("text")
                .attr("id", "tooltip6")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[3])
                .attr("dy",timey(profit[i]-j*4) );


        timeseriessvg.append("text")
                .attr("id", "tooltip7")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[4])
                .attr("dy",timey(profit[i]-j*5) );
                 


        timeseriessvg.append("text")
                .attr("id", "tooltip8")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[5])
                .attr("dy",timey(profit[i]-j*6) );

        timeseriessvg.append("text")
                .attr("id", "tooltip9")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[6])
                .attr("dy",timey(profit[i]-j*7) );

        timeseriessvg.append("text")
                .attr("id", "tooltip10")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[7])
                .attr("dy",timey(profit[i]-j*8) );

        timeseriessvg.append("text")
                .attr("id", "tooltip11")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[8])
                .attr("dy",timey(profit[i]-j*9) );


        timeseriessvg.append("text")
                .attr("id", "tooltip12")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[9])
                .attr("dy",timey(profit[i]-j*10) );


        timeseriessvg.append("text")
                .attr("id", "tooltip13")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[10])
                .attr("dy",timey(profit[i]-j*11) );

        timeseriessvg.append("text")
                .attr("id", "tooltip14")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[11])
                .attr("dy",timey(profit[i]-j*12) );
        
        timeseriessvg.append("text")
                .attr("id", "tooltip15")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[12])
                .attr("dy",timey(profit[i]-j*13) );


        timeseriessvg.append("text")
                .attr("id", "tooltip16")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[13])
                .attr("dy",timey(profit[i]-j*14) );

        timeseriessvg.append("text")
                .attr("id", "tooltip17")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[14])
                .attr("dy",timey(profit[i]-j*15) );

        timeseriessvg.append("text")
                .attr("id", "tooltip18")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[15])
                .attr("dy",timey(profit[i]-J*16) );


        timeseriessvg.append("text")
                .attr("id", "tooltip19")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[16])
                .attr("dy",timey(profit[i]-j*17) );

        timeseriessvg.append("text")
                .attr("id", "tooltip20")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[17])
                .attr("dy",timey(profit[i]-j*18) );


        timeseriessvg.append("text")
                .attr("id", "tooltip21")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[18])
                .attr("dy",timey(profit[i]-j*19) );

        timeseriessvg.append("text")
                .attr("id", "tooltip22")
                .attr("dx",timex(counts[i]+x_pos[i]))
                .attr("text-anchor", text_pos[i])
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "gray")
                .text(title_list[19])
                .attr("dy",timey(profit[i]-j*20) );





        })
        .on("mouseout", function() {
        //Remove the tooltip
            d3.select("#tooltip1").remove();
            d3.select("#tooltip2").remove();
            d3.select("#tooltip3").remove();
            d3.select("#tooltip4").remove();
            d3.select("#tooltip5").remove();
            d3.select("#tooltip6").remove();
            d3.select("#tooltip7").remove();
            d3.select("#tooltip8").remove();
            d3.select("#tooltip9").remove();
            d3.select("#tooltip10").remove();
            d3.select("#tooltip11").remove();
            d3.select("#tooltip12").remove();
            d3.select("#tooltip13").remove();
            d3.select("#tooltip14").remove();
            d3.select("#tooltip15").remove();
            d3.select("#tooltip16").remove();
            d3.select("#tooltip17").remove();
            d3.select("#tooltip18").remove();
            d3.select("#tooltip19").remove();
            d3.select("#tooltip20").remove();
            d3.select("#tooltip21").remove();
            d3.select("#tooltip22").remove();
            d3.select("#tooltip23").remove();

        })

    //// Label axis
    timeseriessvg.append("text")
            .attr("class", "y label")
            .text("Average revenue of a movie in the cluster in millions od USD")
            .attr("x", -300)
            .attr("y",20)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "25px")
            .attr("transform", "rotate(-90)")
            .attr("fill", "gray");          
    timeseriessvg.append("text")
            .attr("class", "x label")
            .text("Average profit of a movie in the cluster in millions of USD")
            .attr("x", 460)
            .attr("y",595)
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
        .call(d3.axisBottom(timex));
    timeseriessvg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(80," + 00 + ")")
        .call(d3.axisLeft(timey));})

