// a simple undirected graph structure
// graph can store vertices of any kind and
var util = require('util');

function isEmpty(obj) {
    for(var prop in obj) { if(obj.hasOwnProperty(prop)) return false; }
    return true;
}

function Edge()
{
    if (arguments.length == 2) {
        if (parseInt(arguments[0]._id) < parseInt(arguments[1]._id)) {
            this.v0 = arguments[0]._id;
            this.v1 = arguments[1]._id;
        } else {
            this.v0 = arguments[1]._id;
            this.v1 = arguments[0]._id;
        }
    } else {
        if (arguments.length==1) {
            var V = arguments[0].split(":");
            this.v0 = V[0];
            this.v1 = V[1];
        } else {
            console.log("Uh Oh.");
        }
    }
}
Edge.prototype.toString = function()
{
    return this.v0+":"+this.v1;
};

function Graph()
{
    this.N = {};
    this.E = {};
    this.nodeid = 0;
}
Graph.prototype.newNodeID = function()
{
    id = this.nodeid++;
    return id.toString();
};

Graph.prototype.isGraphVertex = function(v)
{
    for (n in this.N) {
        if (this.N[n].equals(v)) {
            return this.N[n];
        }
    }
    return null;
}

Graph.prototype.checkVertex = function(v)
{
    // see if this vertex is already in the node list
    n=this.isGraphVertex(v);
    if (n != null){ return n; }
    // insert into graph
    v['_id'] = this.newNodeID();
    this.N[v._id] = v;
    return v;
};

Graph.prototype.addEdge = function(v0, v1)
{
    if (!('root' in this)) this['root'] = v0;
    v0 = this.checkVertex(v0);
    v1 = this.checkVertex(v1);
    var edge = new Edge(v0,v1);
    if (!(edge in this.E))
    {
        if (!('adjacent' in v0)) { v0['adjacent'] = {}; }
        if (!('adjacent' in v1)) { v1['adjacent'] = {}; }
        v0.adjacent[v1._id]=v1;
        v1.adjacent[v0._id]=v0;
        this.E[edge] = edge;
    }
    return edge;
};

Graph.prototype.removeEdge = function() {
    var edge;
    if (arguments.length == 2) {
        edge = new Edge(arguments[0], arguments[1]);
    } else {
        edge = new Edge(arguments[0]);
    }
    if (edge in this.E)
    {
        var v0=this.N[edge.v0], v1=this.N[edge.v1];
        delete v0.adjacent[v1._id];
        delete v1.adjacent[v0._id];
        // remove dangling vertices
        //if(isEmpty(v0.adjacent)) delete this.N[v0._id];
        //if(isEmpty(v1.adjacent)) delete this.N[v1._id];
        delete this.E[edge];
    }
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
    result=[];
    for (key in this.E)
        result.push(this.E[key]);
    return result;
};

module.exports =
{
    Graph : Graph,
    Edge  : Edge
};
