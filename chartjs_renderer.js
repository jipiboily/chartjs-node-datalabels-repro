const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const ChartDataLabels = require('chartjs-plugin-datalabels');

const width = 550; //px
const height = 412; //px

module.exports = class GraphRenderer {
  constructor(req, res) {
    try {
      let body = '';

      req.on('data', function (data) {
        body += data
        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6) {
          req.connection.destroy();
        }
      });

      req.on('end', () => {
        try {

          // Custom configuration & plugins
          const chartCallback = (ChartJS) => {
            // ChartJS.unregister(ChartDataLabels);
            ChartJS.register(ChartDataLabels);
            // ChartJS.defaults.plugins.datalabels.display = false
          };

          const chartJsFactory = () => {
            console.log('IN FACTORY')
            const Chart = require('chart.js');
            require('chartjs-plugin-datalabels');
            delete require.cache[require.resolve('chart.js')];
            delete require.cache[require.resolve('chartjs-plugin-datalabels')];
            // const ChartDataLabels = require('chartjs-plugin-datalabels');
            // Chart.register(ChartDataLabels);
            return Chart;
          }

          // const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: width, height: height, plugins: {requireChartJSLegacy: ['chartjs-plugin-datalabels']}});
          const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: width, height: height, chartCallback: chartCallback, chartJsFactory: chartJsFactory });
          // const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: width, height: height, chartJsFactory: chartJsFactory });
          // const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: width, height: height, chartCallback: chartCallback })

          chartJSNodeCanvas.registerFont('./assets/fonts/Roboto-Regular.ttf', { family: 'Roboto Regular' });

          // Prepare configuration of the graph
          (async () => {
            let configuration = {
              type: 'pie',
              data: {
                  labels: ['A', 'B', 'C'],
                  datasets: [
                    {
                      "label": "Sessions",
                      "data": [23, 32, 44],
                      "backgroundColor": ["yellow", 'lightBlue', 'lightGreen'],
                    },
                  ]
              }
            }

            // Render and return API response
            const image = await chartJSNodeCanvas.renderToBuffer(configuration);
            res.setHeader("Content-Type", "image/png");
            res.write(image, "binary");
            res.end();
          })()
        } catch(e) {
          // Bugsnag.notify(e)
          console.error(`Exception: ${e}`)

          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Oops. Something bad happened.');
        }
      })

    } catch(e) {
      // Bugsnag.notify(e)
      console.error(`Exception: ${e}`)

      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Oops. Something bad happened.');
    } finally {
      // console.timeEnd(requestID, `Done serving ${req.url}`)
    }
  }
}
