const { Container, Service, publicInternet, PortRange } = require('@quilt/quilt');

function Elasticsearch(n) {
  const ref = new Container('elasticsearch:2.4',
    [
      '--transport.tcp.port', `${this.transportPorts.min}-${this.transportPorts.max}`,
      '--http.port', this.port.toString(),
    ]);
  this.service = new Service('elasticsearch', ref.replicate(n));

  if (n > 1) {
    const hosts = this.service.children().join(',');
    this.service.containers.forEach((c) => {
      c.command.push(
        '--discovery.zen.ping.unicast.hosts', hosts,
        '--network.host', '0.0.0.0');
    });
  }

  this.service.connect(this.transportPorts, this.service);
}

Elasticsearch.prototype.uri = function uri() {
  return `http://${this.service.hostname()}:${this.port}`;
};

Elasticsearch.prototype.allowFromPublic = function allowFromPublic() {
  publicInternet.connect(this.port, this.service);
  return this;
};

Elasticsearch.prototype.addClient = function addClient(clnt) {
  clnt.connect(this.port, this.service);
};

Elasticsearch.prototype.deploy = function deploy(depl) {
  depl.deploy(this.service);
};

Elasticsearch.prototype.transportPorts = new PortRange(9300, 9400);
Elasticsearch.prototype.port = 9200;

exports.Elasticsearch = Elasticsearch;
