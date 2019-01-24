// !preview r2d3 data=data

function createLegend() {

  let legend = [];

  cRange.forEach((d, i, arr) => {
    legend[i] = {
      x: 20,
      y: legHeight / (arr.length + 1) * (i + 1),
      clr: cScale(d),
      lab: d
    };
  });

  return legend;
  
}

let pointR = 3;
  
let margin = {
  top: 10,
  bottom: 30,
  left: 50,
  right: 160
};

let plotWidth = width - margin.left - margin.right,
    plotHeight = height - margin.top - margin.bottom,
    xRange = d3.extent(data, d => d.x),
    yRange = d3.extent(data, d => d.y),
    cRange = [...new Set(data.map(d => d.clr))],
    legHeight = cRange.length * 30;
  
let xScale = d3
      .scaleLinear()
      .domain(xRange)
      .range([0, plotWidth])
      .nice(),
    yScale = d3
      .scaleLinear()
      .domain(yRange)
      .range([plotHeight, 0])
      .nice(),
    xAxis = d3
      .axisBottom()
      .scale(xScale)
      .tickSizeOuter(0),
    yAxis = d3
      .axisLeft()
      .scale(yScale)
      .tickSizeOuter(0),
    cScale = d3
      .scaleOrdinal()
      .domain(cRange)
      .range(d3.schemeAccent);

let plot = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

plot.append('g')
  .attr('class', 'pointsPlot')
  .selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
    .attr('class', 'plot')
    .attr('r', pointR)
    .attr('opacity', 0.5)
    .attr('fill', d => cScale(d.clr))
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y));
    
plot.append('g')
  .call(xAxis)
  .attr('transform', `translate(0, ${plotHeight})`)
  .attr('class', 'xAxis');
  
plot.append('g')
  .call(yAxis)
  .attr('class', 'yAxis');
  
plot.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${plotWidth + 10}, ${(plotHeight - legHeight)  / 2})`)
  .append('rect')
    .attr('class', 'legend')
    .attr('width', 150)
    .attr('height', legHeight)
    .attr('stroke', 'lightgrey')
    .attr('fill', 'transparent')
    .attr('rx', '5px');

let legend = createLegend();

plot.select('.legend')
  .selectAll('circle')
  .data(legend)
  .enter()
  .append('circle')
    .attr('class', 'legend')
    .attr('r', 5)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('fill', d => d.clr);
    
plot.select('.legend')
  .selectAll('text')
  .data(legend)
  .enter()
  .append('text')
    .attr('class', 'legend')
    .attr('font-size', 10)
    .attr('x', d => d.x + 10)
    .attr('y', d => d.y)
    .attr('alignment-baseline', 'middle')
    .text(d => d.lab);
    
r2d3.onRender(function(data, svg, width, height, options) {

  let xRange = d3.extent(data, d => d.x),
      yRange = d3.extent(data, d => d.y);
      
  xScale.domain(xRange);
  yScale.domain(yRange);

  svg.select('.xAxis')
    .transition()
    .call(xAxis);
    
  svg.select('.yAxis')
    .transition()
    .call(yAxis)

  let circle = svg
    .select('g.pointsPlot')
    .selectAll('circle.plot')
    .data(data)
  
  circle.exit().remove();
  circle.enter().append('circle')
    .attr('class', 'plot')
    .attr('r', 0)
    .attr('cx', plotWidth / 2)
    .attr('cy', plotHeight / 2)
    .transition()
    .attr('r', pointR)
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('fill', d => cScale(d.clr));
  
  cRange = [...new Set(data.map(d => d.clr))],
  legHeight = cRange.length * 30;
  
  legend = createLegend();
  
  svg.select('g.legend')
    .transition()
    .attr('transform', `translate(${plotWidth + 10}, ${(plotHeight - legHeight)  / 2})`)
  
  svg.select('rect.legend')
    .transition()
    .attr('height', legHeight);
    
  let circleLeg = svg
    .selectAll('circle.legend')
    .data(legend);
  
  circleLeg.exit().remove();
  circleLeg.enter().append('circle');
  
  circleLeg.transition()
    .attr('class', 'legend')
    .attr('r', 5)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('fill', d => d.clr);
    
  let textLeg = svg
    .selectAll('text.legend')
    .data(legend);
    
  textLeg.exit().remove();
  textLeg.enter().append('text');
  
  textLeg.transition()
    .attr('y', d => d.y)
    .text(d => d.lab);
  
});