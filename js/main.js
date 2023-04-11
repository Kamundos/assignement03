
// elements
let data, scatterplot, barchart;

// dispatcher
const dispatcher = d3.dispatch('filterRegions');

// data
d3.csv('africa_country_profile_variables.csv')
  .then(_data => {
    data = _data;
    data.forEach(d => {
      d.population = +d.population;
      d.density = +d.density;
      d.area = +d.area;
      d.GDP = +d.GDP;
    });

    // scales
    const colorScale = d3.scaleOrdinal()
      .range(d3.schemeCategory10)
      .domain(d3.groups(data, d => d.Region).map(d => d[0]));

    // Scatterscales
    scatterplot = new Scatterplot({
      parentElement: '#scatterplot',
      colorScale: colorScale
    }, data);
    scatterplot.updateVis();

  // barscales
    barchart = new Barchart({
      parentElement: '#barchart',
      colorScale: colorScale
    }, dispatcher, data);
    barchart.updateVis();
  })
  .catch(error => console.error(error));


 // Dispatcher 
dispatcher.on('filterRegions', selectedRegions => {
  console.log(selectedRegions)
  if (selectedRegions.length == 0) {
    scatterplot.data = data;
  } else {
    scatterplot.data = data.filter(d => selectedRegions.includes(d.Region));
  }
  scatterplot.updateVis();
});
