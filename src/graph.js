// a simple undirected graph structure
// graph can store vertices of any kind and
var util = require('util');

function isEmpty(obj) {
    for(var prop in obj) { if(obj.hasOwnProperty(prop)) return false; }
    return true;
}

function Graph()
{
    this.N = {};
    this.nodeid = 0;
}
Graph.prototype.newNodeID = function()
{
    id = this.nodeid++;
    return id.toString();
};

Graph.prototype.addEdge = function(v0, v1)
{
    if (!('root' in this)) this['root'] = v0;
    if (!('_id' in v0)) v0['_id'] = this.newNodeID();
    if (!('_id' in v1)) v1['_id'] = this.newNodeID();
    if (!('adjacent' in v0)) { v0['adjacent'] = {}; }
    if (!('adjacent' in v1)) { v1['adjacent'] = {}; }
    v0.adjacent[v1._id]=v1;
    v1.adjacent[v0._id]=v0;
    this.N[v0._id]=v0;
    this.N[v1._id]=v1;
};
Graph.prototype.removeEdge = function(v0, v1)
{
    delete v0.adjacent[v1._id];
    delete v1.adjacent[v0._id];
    if(isEmpty(v0.adjacent)) delete this.N[v0._id];
    if(isEmpty(v1.adjacent)) delete this.N[v1._id];
};

Graph.prototype.DFS = function(visitor, startnode)
{
    var visited = {};
    var G = this;
    if (!startnode) startnode = this.root;

    var visit = function(node)
    {
        if (!(node._id in visited))
        {
            visited[node._id] = true;
            visitor(node);
            for (var a in node.adjacent)
            {
                visit(G.N[a]);
            }
        }
    };
    visit(startnode);
};

Graph.prototype.getEdges = function()
{
    var edges = [];

    edgeVisitor = function(node)
    {
        for(var a in node.adjacent)
        {
            var newEdge = true;
            var edge = { v0: node._id, v1: a };
            for (var eid in edges)
            {
                var e = edges[eid];
                if (  (edge.v0==e.v0 && edge.v1==e.v1)
                   || (edge.v0==e.v1 && edge.v1==e.v0) )
                {
                    newEdge=false;
                    break;
                }
            }
            if (newEdge) {
                edges.push( edge );
            }
        }
    };

    this.DFS(edgeVisitor);

    return edges;
};

module.exports =
{
    Graph : Graph
};
