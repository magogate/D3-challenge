/**
 *  SVG & Other Initialization
 *  */

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
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

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(myData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(myData, d => d[chosenXAxis]) * 0.8,
      d3.max(myData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderText(textGroups, xLinearScale, yLinearScale, chosenXaxis){

  textGroups.transition()
            .duration(1000)            
            .attr("y", 0)
            .transition()
            .duration(1000)
            .attr("x", function(d){
              // console.log(d)
              return xLinearScale(d[chosenXaxis])
            })
            .attr("y", d => yLinearScale(d.healthcare));  

  return textGroups;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
                .duration(1000)
                .attr("fill", "red")
                .attr("opacity", ".1")
                .transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("fill", "#00008b")
                .attr("opacity", ".5");

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Hair Length:";
  }
  else {
    var label = "# of Albums:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      // return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
      console.log(d[chosenXAxis])
      return (`<div style="background-color: black;"><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">${d.state}</p><hr style="border-color: azure; margin-top: 0em; margin-bottom: 0em;"><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">${chosenXAxis} : ${d[chosenXAxis]}</p><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">Obesity: ${d.obesity}</p><div>`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


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
                      // console.log(d)
                      return (`<div style="background-color: black;"><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">${d.state}</p><hr style="border-color: azure; margin-top: 0em; margin-bottom: 0em;"><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">Poverty : ${d.poverty}</p><p class="toolTip" style="margin-top: 0em; margin-bottom: 0em;">Obesity: ${d.obesity}</p><div>`);
                    });

  // https://github.com/Caged/d3-tip/issues/187
  // Step 2: Create the tooltip in chartGroup.
  chartGroup.call(toolTip);


  // Add x-axis
  var xAxis = chartGroup.append("g")
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
        var textGroups = chartGroup.selectAll(".text")
                            .data(myData)
                            .enter()
                            .append("text")
                            // .attr("x", d => xLinearScale(d.poverty))
                            .attr("x", function(d){
                                          // console.log(d)
                                          return xLinearScale(d.poverty)
                                        })
                            .attr("y", d => yLinearScale(d.healthcare))                                     
                            .text(d => d.abbr)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            .attr("fill", "black")
                            .attr("weight", "bold")
                            // https://stackoverflow.com/questions/16620267/how-to-center-text-in-a-rect-element-in-d3
                            .attr("text-anchor", "middle");

                            circlesGroup.on("mouseover", function(d){
                                        toolTip.show(d, this)
                                      })// onmouseout event
                                      .on("mouseout", function(data, index) {
                                        toolTip.hide(data);
                                      });

    var labelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "poverty") // value to grab for event listener
                                .classed("active", true)
                                .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 45)
                                .attr("value", "age") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Age (median)");

    var incomeLabel = labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 65)
                                .attr("value", "income") // value to grab for event listener
                                .classed("inactive", true)
                                .text("House Hold Income (Median)");

    // append y axis
    chartGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 40 - margin.left)
                        .attr("x", 0 - (height / 2))
                        .attr("dy", "1em")
                        .classed("active", true)
                        .text("Lacks Healthcare (%)");

    // x axis labels event listener
  labelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(myData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            //updating inner text of a circle
            textGroups = renderText(textGroups, xLinearScale, yLinearScale, chosenXAxis)

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
            }
          }
        });

})

