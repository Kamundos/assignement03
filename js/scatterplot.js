class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    // / Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 750,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 40, right: 20, bottom: 20, left: 60},
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * This function contains all the code that gets excecuted only once at the beginning.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    // You need to adjust the margin config depending on the types of axis tick labels

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
    // Initialize scales
    // Note color scales in main.js
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    vis.rScale = d3.scaleLinear()
      .range([5, 40])

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

  }

  /**
   * This function contains all the code to prepare the data before we render it.
   */
  updateVis() {
    let vis = this;

    // Specificy accessor functions
    vis.colorValue = d => d.Region;
    vis.xValue = d => d.area;
    vis.yValue = d => d.population;
    // rvalue
    vis.rValue = d => d.GDP;

    // Set the scale input domains
    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
    // rscale
    vis.rScale.domain([0, d3.max(vis.data, vis.rValue)]);

    vis.renderVis();
  }

  /**
     * This function contains the D3 code for binding data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add circles
    const circles = vis.chart.selectAll('.point')
      .data(vis.data, d => d.trail)
      .join('circle')
      .attr('class', 'point')
      .attr('r', d => vis.rScale(vis.rValue(d)))
      .attr('cy', d => vis.yScale(vis.yValue(d)))
      .attr('cx', d => vis.xScale(vis.xValue(d)))
      .attr('fill', d => vis.config.colorScale(vis.colorValue(d)));

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())
  }
}
// Resources
//  https://github.com/UBC-InfoVis/2021-436V-tutorials/tree/master/2_D3_Tutorial#3-reusable-d3-components-es6-
//  https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-scatter-plot