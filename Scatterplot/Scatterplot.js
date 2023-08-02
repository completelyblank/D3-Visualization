import * as d3 from "https://cdn.skypack.dev/d3@7.3.0";
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then((data)=>{
  console.log(data)

  let minutes = d3.timeParse("%M:%S")

  let minYear =(d3.min(data,(d)=>d.Year))
  let maxYear =(d3.max(data,(d)=>d.Year))
  let minTime =minutes((d3.min(data,(d)=>d.Time)))
  let maxTime =minutes((d3.max(data,(d)=>d.Time)))
  
  let w = 1200
  let h = 800
  let padding = 40
  // =================================HERE"S ALL THE TOOLTIP STUFF==============================
  // User Story #14: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
   // User Story #15: My tooltip should have a data-year property that corresponds to the data-xvalue of the active area.
  
  let key = ["No doping allegations", "Yes doping allegations"]
  let colors = d3.scaleOrdinal()
    .domain(key)
    .range(d3.schemePastel1)
  
  let toolTip = d3.select(".chart")
    .append("div")
      .style("position", "absolute")
      .attr("id", "tooltip")
      .style("background-color", "white")
      .style("opacity", 0)
      .style("border-radius", "5px")
      .style("padding", "5px")
  
  let mouseover=(d,i)=>{
    let pos = d3.pointer(mouseover);
    toolTip.html(i["Name"]+": "+i["Nationality"]+"<br>"+"Year: "+i["Year"]+ " Time: "+i["Time"]+"<br><br>"+i["Doping"])
    .style("opacity", 0.8)
    .attr("data-year",(i["Year"]))
    .style("left", event.pageX+20+"px")
    .style("top", event.pageY-50+"px")
    
  }

  let svg = d3.select(".chart")
    .append("svg")
    .attr("width",w+"px")
    .attr("height",h+"px")
    .style("background-color", "aliceblue")
    .style("border-radius","5px")
    // User Story #1: I can see a title element that has a corresponding id="title".

  svg.append("text")
    .text("Doping in Pro Bicycle Racing")
    .attr("id","title")
    .attr("x", w/3)
    .attr("y", 50)
    .attr("class","title")
    
  // User Story #2: I can see an x-axis that has a corresponding id="x-axis".
  // User Story #10: I can see multiple tick labels on the x-axis that show the year.
  // User Story #11: I can see that the range of the x-axis labels are within the range of the actual x-axis data.
  const xScale = d3.scaleTime()
    .domain([minYear-1,maxYear])
    .range([padding, w-padding])
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format(".0f"))

  svg.append("g")
    .attr("transform","translate(0,"+(h-padding)+")")
    .attr("id","x-axis")
    .call(xAxis)

  // User Story #3: I can see a y-axis that has a corresponding id="y-axis".
  // User Story #9: I can see multiple tick labels on the y-axis with %M:%S time format.
  // User Story #12: I can see that the range of the y-axis labels are within the range of the actual y-axis data.
  const yScale = d3.scaleTime()
    // make fastest at top
    .domain([maxTime,minTime])
    .range([h-padding,padding])
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%M:%S"))

  svg.append("g")
    .attr("transform","translate("+padding+",0"+")")
    .attr("id","y-axis")
    .call(yAxis)

  // User Story #4: I can see dots, that each have a class of dot, which represent the data being plotted.

  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class","dot")
    .attr("r", 8.5)
    .attr("cx",(d)=>xScale(d.Year))
    // .attr("cy",(d)=>d3.timeParse(d.Time))
    .attr("cy",(d)=>yScale(minutes(d.Time)))
    // User Story #5: Each dot should have the properties data-xvalue and data-yvalue containing their corresponding x and y values.
    // User Story #6: The data-xvalue and data-yvalue of each dot should be within the range of the actual data and in the correct data format. For data-xvalue, integers (full years) or Date objects are acceptable for test evaluation. For data-yvalue (minutes), use Date objects.
    // User Story #7: The data-xvalue and its corresponding dot should align with the corresponding point/value on the x-axis.
    // User Story #8: The da/ta-yvalue and its corresponding dot should align with the corresponding point/value on the y-axis.
    .attr("data-xvalue", (d,i)=>d.Year)
    // .attr("data-yvalue", (d)=>timeParse(d.Time))
    .attr("data-yvalue",(d,i)=>minutes(d.Time))
    .style("fill",function(d,i){
      if(d["Doping"]==="")
      {
        return ("rgb(251,180,174)");
      }
      else
      {
        return("rgb(179,205,227)")
      }
    })
 
  .on("mouseover", mouseover)
  .on("mouseleave",()=>
  {return toolTip.style("opacity",0)})

  
  // =================================HERE"S ALL THE LEGEND STUFF==============================
    // User Story #13: I can see a legend containing descriptive text that has id="legend".
  //super cool!! scaleOrdinal creates color scales from data (domain) & lot of different built in themes (range)
  
  
  svg.append("text")
    .text("Legend: ")
    .attr("id","legend")
    .attr("x", w-padding*4.5)
    .attr("y", 150)
  svg.selectAll("legenddots")
    .data(key)
    .enter()
    .append("rect")
      .attr("x",w-padding*2).attr("y",(d,i)=>175+i*(20+5)).attr("width",20).attr("height",20).style("fill",(d)=>colors(d))
    svg.selectAll("legendlabels")
      .data(key)
      .enter()
        .append("text")
        .attr("x",w-padding*7).attr("y",(d,i)=>185+i*(20+5)).attr("width",20).attr("height",20).style("fill",(d)=>colors(d)).attr("text-anchor","left").style("alignment-baseline", "middle")
        .text((d)=>d)
  

  

 
})