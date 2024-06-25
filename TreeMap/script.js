import * as d3 from "https://cdn.skypack.dev/d3@7.3.0";

const videoGameSalesUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

fetch(videoGameSalesUrl)
  .then(response => response.json())
  .then(data => {
    const width = 960;
    const height = 600;

    const svg = d3.select("#treemap")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3.select("#tooltip");

    const root = d3.hierarchy(data)
      .eachBefore(d => {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    d3.treemap()
      .size([width, height])
      .paddingInner(1)(root);

    const categories = Array.from(new Set(root.leaves().map(d => d.data.category)));
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(["#ff69b4", "#32cd32", "#00ced1", "#ff4500", "#1e90ff", "#ff1493", "#adff2f", "#7fffd4", "#ff6347", "#4682b4"]); // neon colors

    const tiles = svg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    tiles.append("rect")
      .attr("class", "tile")
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.category))
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
          .attr("data-value", d.data.value)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    tiles.append("text")
      .attr("class", "tile-text")
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text(d => d);

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(0,${height + 20})`);

    const legendRectSize = 18;
    const legendSpacing = 4;

    const legendItems = legend.selectAll("g")
      .data(categories)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * (legendRectSize + legendSpacing) * 3}, 0)`);

    legendItems.append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .attr("fill", colorScale)
      .attr("class", "legend-item");

    legendItems.append("text")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(d => d);
  });
