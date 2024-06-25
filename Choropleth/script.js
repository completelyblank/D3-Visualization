import * as d3 from "https://cdn.skypack.dev/d3@7.3.0";
import { feature } from "https://cdn.skypack.dev/topojson-client@3.1.0";

const educationUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countiesUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(educationUrl), d3.json(countiesUrl)])
  .then(([educationData, countiesData]) => {
    const width = 960;
    const height = 600;

    const svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3.select("#tooltip");

    const colorScheme = d3.schemeReds[9];
    const colorScale = d3.scaleQuantize()
      .domain([d3.min(educationData, d => d.bachelorsOrHigher), d3.max(educationData, d => d.bachelorsOrHigher)])
      .range(colorScheme);

    const counties = feature(countiesData, countiesData.objects.counties).features;

    svg.selectAll("path")
      .data(counties)
      .enter().append("path")
      .attr("class", "county")
      .attr("d", d3.geoPath())
      .attr("fill", d => {
        const county = educationData.find(ed => ed.fips === d.id);
        return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
      })
      .attr("data-fips", d => d.id)
      .attr("data-education", d => {
        const county = educationData.find(ed => ed.fips === d.id);
        return county ? county.bachelorsOrHigher : 0;
      })
      .on("mouseover", function(event, d) {
        const county = educationData.find(ed => ed.fips === d.id);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(county ? `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%` : "No data")
          .attr("data-education", county ? county.bachelorsOrHigher : 0)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(0,${height - 40})`);

    const legendWidth = 300;
    const legendHeight = 20;

    const xScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const xAxis = d3.axisBottom(xScale)
      .tickSize(legendHeight)
      .tickValues(colorScale.range().map(d => colorScale.invertExtent(d)[0]));

    const legendBar = legend.selectAll(".legend-bar")
      .data(colorScale.range())
      .enter().append("rect")
      .attr("x", (d, i) => i * (legendWidth / colorScale.range().length))
      .attr("y", 0)
      .attr("width", legendWidth / colorScale.range().length)
      .attr("height", legendHeight)
      .attr("fill", d => d);

    legend.append("g")
      .attr("transform", `translate(0,0)`)
      .call(xAxis)
      .select(".domain").remove();
  });
