const {createDeployment, Machine} = require("@quilt/quilt");
var Elasticsearch = require("./elasticsearch.js").Elasticsearch;

var clusterSize = 2;

var deployment = createDeployment({});
var baseMachine = new Machine({provider: "Amazon"});
deployment.deploy(baseMachine.asMaster());
deployment.deploy(baseMachine.asWorker().replicate(clusterSize));
deployment.deploy(new Elasticsearch(clusterSize).public());
