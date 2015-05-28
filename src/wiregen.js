#!/usr/bin/env node
"use strict";
// WireGen - electrical appliance hypothesis
// 
// ulrich.krispel@vc.fraunhofer.at
//
var fs=require('fs')
var path=require('path')
var util = require('util');
var pkg=require( path.join(__dirname, 'package.json') );
var program = require('commander');

var vec = require('./vec');
var wgutil = require('./wgutil');
var grammar = require('./grammar');
var graph = require('./graph');
var graph2d = require('./graph-2d');
var svgexport = require('./svgexport');

// globals
var TerminalSymbols = [];
var EndPoints = [];
var Symbols = [];
var Grammar = {};

// -----------------------------------------------------
function readJSON(filename)
{
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}

// Parse command line options
program
    .version(pkg.version)
    .option('-i, --input [json]', 'Set Input Symbols', 'input.json')
    .option('-g, --grammar [json]', 'Set Installation Zone Grammar', 'grammar.json')
    .parse(process.argv);

// read installation zone grammar
console.log('reading installation zone grammar from %s', program.grammar);
Grammar = readJSON(program.grammar);
console.log('parsed %d grammar rules', Object.keys(Grammar).length);

// read semantic entities (input symbols)
console.log('* reading semantic entities from %s', program.input);
Symbols = readJSON(program.input);
console.log('parsed %d entities', Symbols.length);

// evaluate the grammar
while(Symbols.length > 0)
{
    Symbols = grammar.evaluateGrammarStep(Symbols, TerminalSymbols, Grammar);
}

// grammar utility functions
function getTerminalByAttribute(T, label, attname, attvalue)
{
    for (var t in T) {
        if (T[t].label == label) {
            var a = T[t].attributes;
            if (attname in a) {
                if (a[attname] == attvalue) {
                    return T[t];
                }
            }
        }
    }
    return null;
}


// --------------------------------------------------------------------------------------------------------------------
// build installation zone graph

var G = new graph.Graph();

// get bounding box
var bb = new vec.AABB();
TerminalSymbols.forEach(function (symbol)
{
    var att = symbol.attributes;
    bb.insert(att.left,att.top);
    bb.insert(att.left+att.width,att.top+att.height);
});

// create initial arrangement graph from h and v zones
TerminalSymbols.forEach(function (t)
{
    var att = t.attributes;
    switch(t.label)
    {
        case 'hzone':
        {
            var v0 = new vec.Vec2(bb.bbmin.x, att.pos);
            var v1 = new vec.Vec2(bb.bbmax.x, att.pos);
            //hzones.push(G.addEdge(v0, v1));
            graph2d.insertArrangementEdge(G, v0, v1);
        }
        break;
        case 'vzone':
        {
            var v0 = new vec.Vec2(att.pos, bb.bbmin.y);
            var v1 = new vec.Vec2(att.pos, bb.bbmax.y);
            //vzones.push(G.addEdge(v0, v1));
            graph2d.insertArrangementEdge(G, v0, v1);
        }
        break;
    }
    //fs.writeFileSync(util.format("step-%d.svg",i++), svgexport.ExportGraphToSVG(G));
});

// remove segments that overlap with openings
TerminalSymbols.forEach(function (t) {
    if (t.label=='door' || t.label=='window')
    {
        // test if any graph edge overlaps with an 'obstacle'
        for (var e in G.E)
        {
            if (graph2d.edgeAABBIntersection(G, G.E[e], t.attributes))
            {
                G.removeEdge(e);
            }
        }
    }
});

var ROOT = null;

// insert detections: insert as node if "near" to zone, connect to nearest zone otherwise
TerminalSymbols.forEach(function (t) {
    if (t.label=='switch' || t.label=='socket' || t.label=='root') {
        var a = t.attributes;
        var p = new vec.Vec2(a.left+a.width/2, a.top+a.height/2);
        // get line with minimal normal projection distance
        var mindist=Number.MAX_VALUE;
        var minedge=null;
        for (var e in G.E) {
            var dist = graph2d.pointEdgeDist(G, G.E[e], p);
            if (dist != null) {
                if (dist < mindist) {
                    mindist = dist;
                    minedge = e;
                }
            }
        }
        if (minedge != null) {
            // shortest edge was found
            var wall = getTerminalByAttribute(TerminalSymbols, 'wall', 'id', a.wallid);
            if (wall != null)

            var q = graph2d.edgePointProjection(G, G.E[minedge], p);
            var v = graph2d.splitGraphEdge(G, G.E[minedge], q);
            var endpoint;
            if (p.sub(q).length() > wall.attributes.zone_width/2)
            {
                // add an additional edge, TODO:check for occluders
                G.addEdge(p,q);
                endpoint = { pos:p, terminal:t };
            } else {
                // inside installation zone
                endpoint = { pos:q, terminal:t };
            }
            EndPoints.push(endpoint);
            if (t.label == 'root')
            {
                ROOT = endpoint;
            }
        }
    }
});

//console.log("==Endpoints:");
//console.log(EndPoints);
//console.log("==Terminals:");
//console.log(TerminalSymbols);


// --------------------------------------------------------------------------------------------------------------------
// WIRE HYPOTHESIS
// extract tree from graph:
function findWireTree(G, root, EndPoints)
{
    var EP = EndPoints.slice();
    var T = new graph.Graph();
// - insert root in tree
    var v = G.isGraphVertex(root.pos);
    T.N[v._id]=v;
    wgutil.removeArrObj(EP, root);
    var i =0;
    // - find shortest path from current endpoint to tree, for all endpoints
    while(EP.length > 0)
    {
        var best = { path:{cost: Number.MAX_VALUE }, ep: null };
        for (var epid in EP)
        {
            var ep = EP[epid];
            //console.log("Processing EndPoint: %d,%d", ep.pos.x, ep.pos.y);
            var path = graph2d.getShortestPath(G, T, ep.pos);   // { edge: [], cost: <val> }
            if (path.path.length > 0 && path.cost < best.path.cost) {
                //console.log(util.format("found new best path, cost: %d, old best %d, length", path.cost, best.path.cost, path.path.length));
                best.path = path;
                best.ep   = ep;
            }
        }
        // add path to tree, remove endpoint
        if (best.path.path.length > 0) {
            T.addPathFromGraph(G, best.path.path);
            wgutil.removeArrObj(EP, best.ep);
            //fs.writeFileSync(util.format("wire-graph-%d.svg", ++i), svgexport.ExportGraphToSVG(T));
            if (i > EndPoints.length) {
                return T;
            }
        }
    }
    return T;
}

var WireTree = findWireTree(G, ROOT, EndPoints);
//console.log(WireTree);

// --------------------------------------------------------------------------------------------------------------------

fs.writeFileSync("terminals.svg", svgexport.ExportTerminalsToSVG(TerminalSymbols));
fs.writeFileSync("graph.svg", svgexport.ExportGraphToSVG(G));
fs.writeFileSync("wire-graph.svg", svgexport.ExportGraphToSVG(WireTree));

