const quilt = require('@quilt/quilt');

function getHostname(c) {
  return c.getHostname();
}

function Elasticsearch(n) {
  const ref = new quilt.Container('elasticsearch', 'elasticsearch:2.4', {
    command: [
      '--transport.tcp.port', `${this.transportPorts.min}-${this.transportPorts.max}`,
      '--http.port', this.port.toString(),
    ],
  });
  this.containers = ref.replicate(n);
  this.service = new quilt.Service('elasticsearch-lb', this.containers);

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
  return `http://${this.service.hostname()}:${this.port}`;
};

Elasticsearch.prototype.allowFromPublic = function allowFromPublic() {
  quilt.allow(quilt.publicInternet, this.containers, this.port);
  return this;
};

Elasticsearch.prototype.addClient = function addClient(clnt) {
  this.service.allowFrom(clnt, this.port);
};

Elasticsearch.prototype.deploy = function deploy(depl) {
  depl.deploy(this.containers);
  depl.deploy(this.service);
};

Elasticsearch.prototype.transportPorts = new quilt.PortRange(9300, 9400);
Elasticsearch.prototype.port = 9200;

exports.Elasticsearch = Elasticsearch;
