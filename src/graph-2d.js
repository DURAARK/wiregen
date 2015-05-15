// Graph 2D Utils
var vec  =require('./vec');
var graph=require('./graph');

function removeArrObj(array, object) {
    var index = array.indexOf(object);
    if (index > -1) { array.splice(index, 1); }
}

// test two graph edges for intersection
function edgeIntersection(G, e0, e1)
{
    var v0x = G.N[e0.v0].x, v0y=G.N[e0.v0].y,
        v1x = G.N[e0.v1].x, v1y=G.N[e0.v1].y,
        v2x = G.N[e1.v0].x, v2y=G.N[e1.v0].y,
        v3x = G.N[e1.v1].x, v3y=G.N[e1.v1].y;
    return getIntersection(v0x,v0y,v1x,v1y,v2x,v2y,v3x,v3y);
}

function edgeAABBIntersection(G, e, rect)
{
    // get edge coordinates
    var v0x = G.N[e.v0].x, v0y=G.N[e.v0].y,
        v1x = G.N[e.v1].x, v1y=G.N[e.v1].y;
    var l = rect.left, t = rect.top, r = rect.left+rect.width, b = rect.top+rect.height;
    // intersection with line and bounding box equals to intersection with line and bounding lines
    if (getIntersection(v0x,v0y,v1x,v1y, l,t,r,t) != null) return true;
    if (getIntersection(v0x,v0y,v1x,v1y, l,b,r,b) != null) return true;
    if (getIntersection(v0x,v0y,v1x,v1y, l,t,l,b) != null) return true;
    if (getIntersection(v0x,v0y,v1x,v1y, r,t,r,b) != null) return true;
}

// test intersection of two edges
// solution of the system of equations of lines v0--v1 and v2--v3:
// v0+(v1-v0)*t = v2+(v3-v2)*s
function getIntersection(v0x,v0y,v1x,v1y,v2x,v2y,v3x,v3y)
{
    var det = (v1x-v0x)*(v2y-v3y)-(v2x-v3x)*(v1y-v0y);
    if (det>=-1e-5 && det <=1e-5)
    {   //  parallel lines
        return null;
    }
    var bx = v2x-v0x, by=v2y-v0y;

    var t = ((v2y-v3y)*bx + (v3x-v2x)*by) / det;
    var s = ((v0y-v1y)*bx + (v1x-v0x)*by) / det;
    if (t>0.0 && t<1.0 && s>0.0 && s<1.0)
    {
        return new vec.Vec2(v0x+(v1x-v0x)*t, v0y+(v1y-v0y)*t);
    }
    return null;
};

function edge2txt(G, e)
{
    return (G.N[e.v0].x + "," +G.N[e.v0].y + "-" + G.N[e.v1].x + "," + G.N[e.v1].y );
}

// insert an edge into the graph, calculate intersections with all other graph edges
function insertArrangementEdge(G, v0, v1)
{
    v0 = G.checkVertex(v0);
    v1 = G.checkVertex(v1);
    var splitEdges = [ new graph.Edge(v0,v1).toString() ];

    // simple case
    if (Object.keys(G.E).length == 0)
    {
        G.addEdge(v0, v1);
        return;
    }
    // split all edges that intersect with "splitedge", and partition this edge aswell
    var doIntersection=true;
    while(doIntersection)
    {
        var Continue = false;
        for (var e in G.E)
        {
            var ge = new graph.Edge(e);
            for (seid in splitEdges)
            {
                var se = new graph.Edge(splitEdges[seid]);
                var p = edgeIntersection(G, ge, se);
                // perform split
                if (p != null)
                {
                    Continue = true;
                    // split e: insert vertex in graph
                    p = G.checkVertex(p);
                    // remove edge from graph
                    G.removeEdge(ge.toString());
                    // add new edges in graph
                    G.addEdge(G.N[ge.v0],p);
                    G.addEdge(p, G.N[ge.v1]);
                    removeArrObj(splitEdges, se.toString());
                    splitEdges.push(new graph.Edge(G.N[se.v0], p).toString());
                    splitEdges.push(new graph.Edge(p, G.N[se.v1]).toString());
                    break;
                }
            }
            if (Continue==true) break;
        }
        if (Continue==false) {
            doIntersection = false;
        }
    }
    // insert split edges into graph
    for (seid in splitEdges)
    {
        var se = new graph.Edge(splitEdges[seid]);
        G.addEdge(G.N[se.v0], G.N[se.v1]);
    }
}

module.exports = {
    getIntersection       : getIntersection,
    insertArrangementEdge : insertArrangementEdge,
    edgeAABBIntersection  : edgeAABBIntersection
    //edge2txt : edge2txt
};
