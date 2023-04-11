class Barchart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _dispatcher, _data) {
    // Configuration object with defaults
    // you might want to use getter and setter methods for individual attributes

    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 400,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 40}
    }
    this.dispatcher = _dispatcher;
    this.data = _data;
    this.initVis();
  }

  /**
   * This function contains all the code that gets excecuted only once at the beginning.
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    // the start of each function to store the this-accessor
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    // Adjust the margin config depending on the types of axis tick labels
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])

    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0.12);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group 
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

    // data
    vis.aggregatedData = vis.data = d3.groups(data, d => d.Region)

    // accessor functions
    vis.xValue = d => d[0];
    vis.yValue = d => d[1].length;

    // Set the scale input domains
    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

    vis.renderVis();
  }

  /**
  * This function contains the D3 code for binding data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add rectangles
    const bars = vis.chart.selectAll('.bar')
      .data(vis.aggregatedData, vis.xValue)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => vis.xScale(vis.xValue(d)))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
      .attr('y', d => vis.yScale(vis.yValue(d)))
      .attr('fill', d => vis.config.colorScale(vis.xValue(d)))
      .on('click', function(event, d) {
        // Check point
        const isActive = d3.select(this).classed('active');
        d3.select(this).classed('active', !isActive);

        // names
        const selectedRegions = vis.chart.selectAll('.bar.active').data().map(k => k[0]);
        const a = vis.chart.selectAll('.bar.active').data()
        // Trigger filter event and pass array with the selected category names
        vis.dispatcher.call('filterRegions', event, selectedRegions);
      });

    // Update axes because the underlying scales might have changed
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}

// Resources
// https://github.com/UBC-InfoVis/2021-436V-tutorials/tree/master/2_D3_Tutorial#3-reusable-d3-components-es6-
// https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-bar-chart
