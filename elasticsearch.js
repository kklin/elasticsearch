const quilt = require('@quilt/quilt');

function getHostname(c) {
  return c.getHostname();
}

function Elasticsearch(n) {
  this.containers = [];
  for (let i = 0; i < n; i += 1) {
    this.containers.push(new quilt.Container('elasticsearch', 'elasticsearch:2.4', {
      command: [
        '--transport.tcp.port', `${this.transportPorts.min}-${this.transportPorts.max}`,
        '--http.port', this.port.toString(),
      ],
    }));
  }
  this.loadBalancer = new quilt.LoadBalancer('elasticsearch-lb', this.containers);

  if (n > 1) {
    const hosts = this.containers.map(getHostname).join(',');
    this.containers.forEach((c) => {
      c.command.push(
        '--discovery.zen.ping.unicast.hosts', hosts,
        '--network.host', '0.0.0.0');
    });
  }

  quilt.allow(this.containers, this.containers, this.transportPorts);
}

Elasticsearch.prototype.uri = function uri() {
  return `http://${this.loadBalancer.hostname()}:${this.port}`;
};

Elasticsearch.prototype.allowFromPublic = function allowFromPublic() {
  quilt.allow(quilt.publicInternet, this.containers, this.port);
  return this;
};

Elasticsearch.prototype.addClient = function addClient(clnt) {
  this.loadBalancer.allowFrom(clnt, this.port);
};

Elasticsearch.prototype.deploy = function deploy(depl) {
  depl.deploy(this.containers);
  depl.deploy(this.loadBalancer);
};

Elasticsearch.prototype.transportPorts = new quilt.PortRange(9300, 9400);
Elasticsearch.prototype.port = 9200;

exports.Elasticsearch = Elasticsearch;
