looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "hello_world",
    label: "Hello World",
    options: {
      font_size: {
        type: "string",
        label: "Font Size",
        values: [
          {"Large": "large"},
          {"Small": "small"}
        ],
        display: "radio",
        default: "large"
      }
    },
    
    /**
     * The create function gets called when the visualization is mounted but before any
     * data is passed to it.
     **/
    create: function(element, config){
        element.innerHTML = "<h1>Ready to render!</h1>";
    },
   
    /**
     * UpdateAsync is the function that gets called (potentially) multiple times. It receives
     * the data and should update the visualization with the new data.
     **/
    updateAsync: function(data, element, config, queryResponse, details, done){

        // Clear any errors from previous updates
        this.clearErrors();

        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
   

        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.dimensions.length == 0) {
            this.addError({title: "No Dimensions", message: "This chart requires dimensions."});
            return;
        }

       // set the ranges
       var x = d3.scaleBand()
                 .range([0, width])
                 .padding(0.1);
       var y = d3.scaleLinear()
                 .range([height, 0]);
   
       // append the svg object to the body of the page
       // append a 'group' element to 'svg'
       // moves the 'group' element to the top left margin
       element.innerHTML = ""
       var svg = d3.select("#vis").append("svg")
           .attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom)
           .append("g")
           .attr("transform", 
                 "translate(" + margin.left + "," + margin.top + ")");
       
        //Read the data
        d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv", function(data) {
   
        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        var myGroups = d3.map(data, function(d){return d.group;}).keys()
        var myVars = d3.map(data, function(d){return d.variable;}).keys()
   
        // Build X scales and axis:
        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(myGroups)
        .padding(0.05);

        svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()
   
        // Build Y scales and axis:
        var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(myVars)
        .padding(0.05);
        svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()
   
        // Build color scale
        var myColor = d3.scaleSequential()
       .interpolator(d3.interpolateInferno)
       .domain([1,100])
   
        // create a tooltip
        var tooltip = d3.select("#vis")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
   
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        }
     var mousemove = function(d) {
       tooltip
         .html("The exact value of<br>this cell is: " + d.value)
         .style("left", (d3.mouse(this)[0]+70) + "px")
         .style("top", (d3.mouse(this)[1]) + "px")
     }
     var mouseleave = function(d) {
       tooltip
         .style("opacity", 0)
       d3.select(this)
         .style("stroke", "none")
         .style("opacity", 0.8)
     }
   
     // add the squares
     svg.selectAll()
       .data(data, function(d) {return d.group+':'+d.variable;})
       .enter()
       .append("rect")
         .attr("x", function(d) { return x(d.group) })
         .attr("y", function(d) { return y(d.variable) })
         .attr("rx", 4)
         .attr("ry", 4)
         .attr("width", x.bandwidth() )
         .attr("height", y.bandwidth() )
         .style("fill", function(d) { return myColor(d.value)} )
         .style("stroke-width", 4)
         .style("stroke", "none")
         .style("opacity", 0.8)
       .on("mouseover", mouseover)
       .on("mousemove", mousemove)
       .on("mouseleave", mouseleave)
   })
   
        // Add title to graph
        svg.append("text")
                .attr("x", 0)
                .attr("y", -50)
                .attr("text-anchor", "left")
                .style("font-size", "22px")
                .text("A d3.js heatmap");
        
        // Add subtitle to graph
        svg.append("text")
           .attr("x", 0)
           .attr("y", -20)
           .attr("text-anchor", "left")
           .style("font-size", "14px")
           .style("fill", "grey")
           .style("max-width", 400)
           .text("A short description of the take-away message of this chart.");
   
           done()
        }
});
