#!/usr/bin/env node

var fs=require('fs')
var path=require('path')
var util = require('util');
var pkg=require( path.join(__dirname, 'package.json') );
var program = require('commander');

var vec = require('./vec');
var grammar = require('./grammar');
var graph = require('./graph');
var graph2d = require('./graph-2d');
var svgexport = require('./svgexport');

// globals
var TerminalSymbols = [];
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
console.log('parsed %d grammar rules', Object.keys(grammar).length);

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
        // test if any graph edge overlaps with the window
        for (e in G.E)
        {
            if (graph2d.edgeAABBIntersection(G, G.E[e], t.attributes))
            {
                G.removeEdge(e);
            }
        }
    }
});

// insert detections: insert as node if "near" to zone, connect to nearest zone otherwise
TerminalSymbols.forEach(function (t) {
    if (t.label=='switch' || t.label=='socket') {
        var a = t.attributes;
        var p = new vec.Vec2(a.left+a.width/2, a.top+a.height/2);
        // get line with minimal normal projection distance
        var mindist=Number.MAX_VALUE;
        var minedge=null;
        for (e in G.E) {
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
            if (mindist < wall.attributes.zone_width/2) {
                // insert point on edge, TODO: add this point to output graph points!
                // split the edge
                var q = graph2d.edgePointProjection(G, G.E[minedge], p);
                var v = graph2d.splitGraphEdge(G, G.E[minedge], q);
            } else {
                // insert connection to edge, TODO: insert the edge
            }
        }
    }
});

// --------------------------------------------------------------------------------------------------------------------

fs.writeFileSync("terminals.svg", svgexport.ExportTerminalsToSVG(TerminalSymbols));
fs.writeFileSync("graph.svg", svgexport.ExportGraphToSVG(G));
