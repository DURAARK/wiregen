var util = require('util');


function Vertex()
{
    this.edges = {};
}
function Edge()
{
    this.vertices = {};
}
function Graph()
{
    this.V = [];    // vertices
    this.E = [];    // edges
}


module.exports =
{
    Graph : Graph,
    Vertex : Vertex,
    Edge : Edge
};

