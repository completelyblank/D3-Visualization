import * as d3 from "https://cdn.skypack.dev/d3@7.3.0";

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then((data) => {
    const dataset = data.monthlyVariance;
    const baseTemperature = data.baseTemperature;

    const margin = { top: 50, right: 50, bottom: 100, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip");

   const colorScheme = ["#FF007F", "#FF00FF", "#7F00FF", "#0000FF", "#007FFF", "#00FFFF"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const years = dataset.map(d => d.year);
    const uniqueYears = [...new Set(years)];

    const xScale = d3.scaleBand()
      .domain(uniqueYears)
      .range([0, width])
      .padding(0.01);

    const yScale = d3.scaleBand()
      .domain(months)
      .range([0, height])
      .padding(0.01);

    const colorScale = d3.scaleQuantile()
      .domain([d3.min(dataset, d => d.variance), d3.max(dataset, d => d.variance)])
      .range(colorScheme);

    const xAxis = d3.axisBottom(xScale).tickValues(uniqueYears.filter((d, i) => !(i % 10)));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("id", "x-axis")
      .call(xAxis);

    svg.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    svg.selectAll(".cell")
      .data(dataset)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(months[d.month - 1]))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.variance))
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemperature + d.variance)
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`Year: ${d.year}<br>Month: ${months[d.month - 1]}<br>Temp: ${(baseTemperature + d.variance).toFixed(2)}℃<br>Variance: ${d.variance.toFixed(2)}℃`)
          .attr("data-year", d.year)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width + 20}, 0)`);

    legend.selectAll("rect")
      .data(colorScheme)
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => d);

    legend.selectAll("text")
      .data(colorScheme)
      .enter().append("text")
      .attr("x", 30)
      .attr("y", (d, i) => i * 20 + 15)
      .text(d => {
        const [min, max] = colorScale.invertExtent(d);
        return `${(baseTemperature + min).toFixed(2)} - ${(baseTemperature + max).toFixed(2)}`;
      });
  });
