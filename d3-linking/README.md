Start by launching the webserver with `python -m SimpleHTTPServer`.
(that's with python 2, for python 3 use `python -m http.server`).

In index.html using the my-viz.js file, you'll find two visualizations of earthquake data: a time series scatter and a bar chart. Your goal here is to filter the timeseries using the bars in the bar chart: on hover (or click) of the bars, show only the data from those magnitude earthquakes in the time series.

Hint: Try using an on click event function for the bars and grab the circle using .filter()) for the scatter plot.
You could set the .style visibility of the dots to visible or hidden.



