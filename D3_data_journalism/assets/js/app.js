/**
 *  SVG & Other Initialization
 *  */

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


d3.csv("assets/data/data.csv").then(function(myData, err) {
    //console.log(myData);

    myData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

    // Create scaling functions
  var xLinearScale = d3.scaleLinear()
                        .domain([8, d3.max(myData, d => d.poverty)])
                        .range([0, width]);

  var yLinearScale = d3.scaleLinear()
                        .domain([4, d3.max(myData, d => d.healthcare)])
                        .range([height, 0]);


  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var toolTip = d3.tip()
                    .attr("class", "tooltip")
                    .offset([10, -15])
                    .html(function(d) {
                      console.log(d)
                      return (`<div style="background-color: black;"><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">${d.state}</p><hr style="border-color: azure; margin-top: 0em; margin-bottom: 0em;"><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">Poverty : ${d.poverty}</p><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">Obesity: ${d.obesity}</p><div>`);
                    });

  // https://github.com/Caged/d3-tip/issues/187
  // Step 2: Create the tooltip in chartGroup.
  chartGroup.call(toolTip);


  // Add x-axis
  chartGroup.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(bottomAxis);

  // Add y1-axis to the left side of the display
  chartGroup.append("g")
                    // Define the color of the axis text
                    .classed("green", true)
                    .call(leftAxis);

      // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
                                        .data(myData)
                                        .enter()
                                        .append("circle")
                                        .attr("cx", d => xLinearScale(d.poverty))
                                        .attr("cy", d => yLinearScale(d.healthcare))
                                        .attr("r", 15)
                                        .attr("fill", "#00008b")
                                        .attr("opacity", ".5");                                        

        // here I am using .text in selectALl; there is no such class as such called .text
        // but if I use text, there are already other text attributes exists in html page
        // due to which when I am doing data binding, and calling enter()
        // it is considering prior text dom elements and ignoring them
        // so enter method is finding only few orphan text and binding data against it
        // which is in-correct. we need d3 to bind all data points to new text
        // and to ignore earlier existing text dom elements
        // since in below case there is no .text class exists, d3 will consider no 
        // dom elements exists for data bind, so it will create those many dom elements
        // [by calling append method ] based on available data elemeents
        chartGroup.selectAll(".text")
                            .data(myData)
                            .enter()
                            .append("text")
                            // .attr("x", d => xLinearScale(d.poverty))
                            .attr("x", function(d){
                                          console.log(d)
                                          return xLinearScale(d.poverty)
                                        })
                            .attr("y", d => yLinearScale(d.healthcare))                                     
                            .text(d => d.abbr)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            .attr("fill", "white")
                            .attr("weight", "bold")
                            // https://stackoverflow.com/questions/16620267/how-to-center-text-in-a-rect-element-in-d3
                            .attr("text-anchor", "middle");

                            circlesGroup.on("mouseover", function(d){
                                        toolTip.show(d, this)
                                      })

    var labelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var hairLengthLabel = labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "hair_length") // value to grab for event listener
                                .classed("active", true)
                                .text("In Poverty (%)");

    // append y axis
    chartGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 40 - margin.left)
                        .attr("x", 0 - (height / 2))
                        .attr("dy", "1em")
                        .classed("active", true)
                        .text("Lacks Healthcare (%)");

})

