var vec = require('./vec');
var graph = require('./graph');

// graph test
var G = new graph.Graph();

v0 = new vec.Vec2(0,0);
v1 = new vec.Vec2(10,0);
v2 = new vec.Vec2(10,10);
v3 = new vec.Vec2(0,10);

G.addEdge(v0,v1);
G.addEdge(v0,v2);
G.addEdge(v0,v3);
G.addEdge(v1,v2);
G.addEdge(v2,v3);

var E = G.getEdges();
console.log(E);

console.log('remove v0<->v3');
G.removeEdge(v0,v3);
var E = G.getEdges();
console.log(E);

