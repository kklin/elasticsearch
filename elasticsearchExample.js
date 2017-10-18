const { createDeployment, Machine } = require('kelda');
const Elasticsearch = require('./elasticsearch.js').Elasticsearch;

const clusterSize = 2;

const deployment = createDeployment({});
const baseMachine = new Machine({ provider: 'Amazon' });
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(clusterSize));

const elasticsearch = new Elasticsearch(clusterSize);
elasticsearch.allowFromPublic();
elasticsearch.deploy(deployment);
