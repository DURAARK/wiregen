#!/usr/bin/env node

var fs=require('fs')
var path=require('path')
var pkg=require( path.join(__dirname, 'package.json') );

var vec = require('./vec');
var svgexport = require('./svgexport');
var graph = require('./graph');

// globals
var TerminalSymbols = [];

// -----------------------------------------------------
function readJSON(filename)
{
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}

// -----------------------------------------------------
function isTerminal(symbol)
{
    return symbol.label.toLowerCase() == symbol.label;
}

function evaluateGrammarStep(symbols, grammar)
{
    var result = [];
    GrammarEvaluated = true;
    symbols.forEach(function (lhs)
        {
            var att = lhs.attributes;

            // a symbol is considered terminal if it is not defined in the grammar
            if (lhs.label in grammar)
            {
                GrammarEvaluated = false;
                var dbgtext=lhs.label + " => ";
                var rule = grammar[lhs.label];
                // rule is an array of symbols to create
                rule.forEach( function(rhs)
                {
                    // inherit attributes
                    var newsymbol = {
                        "label" : rhs.label,
                        "attributes" : JSON.parse(JSON.stringify(att))
                    };

                    // evaluate attributes
                    if ('attributes' in rhs)
                        Object.keys(rhs.attributes).forEach(function (attname, attid)
                        {
                           newsymbol.attributes[attname] = eval(rhs.attributes[attname]);
                        } );

                    dbgtext += rhs.label + " ";
                    if (isTerminal(newsymbol))  { TerminalSymbols.push(newsymbol); }
                    else                        { result.push(newsymbol); }

                } );
                console.log(dbgtext);
            } else {
                // rule not found
                console.log("[ERROR] Rule %s not found", lhs.label);
            }
        }
    );
    return result;
}

// --------------------------------------------------------------------------------------------------------------------


// Parse command line options
var program = require('commander');
program
    .version(pkg.version)
    .option('-i, --input [json]', 'Set Input Symbols', 'input.json')
    .option('-g, --grammar [json]', 'Set Installation Zone Grammar', 'grammar.json')
    .parse(process.argv);


// read semantic entities
console.log('* reading semantic entities from %s', program.input);
var symbols = readJSON(program.input);
console.log('parsed %d entities', symbols.length);

// read installation zone grammar
console.log('reading installation zone grammar from %s', program.grammar);
var grammar = readJSON(program.grammar);
console.log('parsed %d grammar rules', Object.keys(grammar).length);

// evaluate the grammar
while(symbols.length > 0)
{
    symbols = evaluateGrammarStep(symbols, grammar);
}

// --------------------------------------------------------------------------------------------------------------------
// build graph from terminal symbols:
// - create node at beginning and end of each installation zone
// - split all hzones by vzones and vice versa
// - connect all midpoints of detections to the nearest line segment

var G = new graph.Graph();

// get bounding box
var bb = new vec.AABB();
TerminalSymbols.forEach(function (symbol)
{
    var att = symbol.attributes;
    bb.insert(att.left,att.top);
    bb.insert(att.left+att.width,att.top+att.height);
});

// create a edge for each hzone and vzone

var hzones = [];
var vzones = [];

// test intersection of two edges
var testIntersection = function (G, e0, e1)
{
    var v0x = G[e0.v0].x, v0y=G[e0.v0].y,
        v1x = G[e0.v1].x, v1y=G[e0.v1].y,
        v2x = G[e1.v0].x, v2y=G[e1.v0].y,
        v3x = G[e1.v1].x, v3y=G[e1.v1].y;
    var det = (v1x-v0x)*(v2y-v3y)-(v2x-v3x)*(v1y-v0y);
    var bx = v2x-v0x, by=v2y-v0y;

    var t = ((v2y-v3y)*bx + (v3x-v2x)*by) / det;
    var s = ((v2y-v3y)*bx + (v3x-v2x)*by) / det;
    if (t>=0.0 && t<=1.0 && s>=0.0 && s<=1.0)
    {
        return new vec.Vec2(v0x+(v1x-v0x)*t, v0y+(v1y-v0x)*t);
    }
    return null;
}

TerminalSymbols.forEach(function (t)
{
    var att = t.attributes;
    switch(t.label)
    {
        case 'hzone':
        {
            var v0 = new vec.Vec2(bb.bbmin.x, att.pos);
            var v1 = new vec.Vec2(bb.bbmax.x, att.pos);
            G.addEdge(v0, v1);
            hzones.push({v0: v0._id, v1: v1._id});
        }
            break;
        case 'vzone':
        {
            var v0 = new vec.Vec2(att.pos, bb.bbmin.y);
            var v1 = new vec.Vec2(att.pos, bb.bbmax.y);
            G.addEdge(v0, v1);
            vzones.push({v0:v0._id,v1:v1._id});
        }
            break;
    }
});

// create intersections
vzones.forEach(function(vzone) {
    // split hzones

});

var E = G.getEdges();
console.log(E);

// --------------------------------------------------------------------------------------------------------------------

var svg=svgexport.ExportTerminalsToSVG(TerminalSymbols);
fs.writeFileSync("result.svg", svg);

