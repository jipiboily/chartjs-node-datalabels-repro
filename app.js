const http = require('http');
const ChartJSRenderer = require('./chartjs_renderer')

const PORT = process.env.PORT || 5000

class App {
  constructor(port) {
    this.port = port;

    // Create the server
    this.server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, 'https://example.com');
        switch (url.pathname) {
          case '/chartjs':
            new ChartJSRenderer(req, res)
            break;

          default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Sadly, this is not a valid URL.');
            break;
        }
      } catch (e) {
        console.log(`Exception: ${e}`)
      }
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.info(`Server running on port ${this.port}`);
    });
  }

  stop() {
    this.server.close()
  }
}

const app = new App(PORT)
app.start()