
var util = require('util');
var vec = require('./vec');

// returns svg string
function ExportTerminalsToSVG(symbols)
{
    var s = 0.1;    // scale

    // get bounding box
    var bb = new vec.AABB();
    symbols.forEach(function (symbol)
    {
        var att = symbol.attributes;
        bb.insert(att.left,att.top);
        bb.insert(att.left+att.width,att.top+att.height);
    });

    var result = util.format('<svg width="%s" height="%s" version="1.1" xmlns="http://www.w3.org/2000/svg">\n', bb.width()*s, bb.height()*s);

    // draw bounding box
    result += util.format('<rect width="%d" height="%d" style="fill:rgb(240,240,240);stroke-width:3;stroke:rgb(0,0,0)" />\n', bb.width()*s, bb.height()*s);

    symbols.forEach(function (symbol)
    {
        var att = symbol.attributes;

        switch(symbol.label)
        {
            case "hzone":
                result += util.format('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke-dasharray="10,10" style="stroke:rgb(255,0,0);stroke-width:2;" />\n', 0, att.pos*s, bb.width()*s, att.pos*s);
                break;
            case "vzone":
                result += util.format('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke-dasharray="10,10" style="stroke:rgb(255,0,0);stroke-width:2;" />\n', att.pos*s, 0, att.pos*s, bb.height()*s);
                break;
            case "door":
                result += util.format('<rect x="%d" y="%d" width="%d" height="%d" style="fill:rgb(200,200,100);stroke-width:3;stroke:rgb(0,0,0)" />\n', att.left*s, att.top*s, att.width*s, att.height*s);
                break;
            case "socket":
                result += util.format('<rect x="%d" y="%d" width="%d" height="%d" style="fill:none;stroke-width:3;stroke:rgb(0,200,0)" />\n', att.left*s, att.top*s, att.width*s, att.height*s);
                break;
            case "switch":
                result += util.format('<rect x="%d" y="%d" width="%d" height="%d" style="fill:none;stroke-width:3;stroke:rgb(0,0,200)" />\n', att.left*s, att.top*s, att.width*s, att.height*s);
                break;
        }
    });

    result += '</svg>\n';

    return result;
}


function ExportGraphToSVG(G) {

    var s = 0.1;    // scale

    // get bounding box
    var bb = new vec.AABB();
    for (var n in G.N) {
        var v = G.N[n];
        bb.insert(v.x, v.y);
    }
    var result = util.format('<svg width="%s" height="%s" version="1.1" xmlns="http://www.w3.org/2000/svg">\n', bb.width()*s, bb.height()*s);
    // draw vertices
    for (var n in G.N) {
        var v = G.N[n];
        result += util.format('<circle cx="%s" cy="%s" r="3" stroke="black" stroke-width="1" fill="black" />\n', v.x*s, v.y*s);
    }
    // draw edges
    for (var eid in G.E) {
        var e = G.E[eid];
        var v0 = G.N[e.v0];
        var v1 = G.N[e.v1];
        result += util.format('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke-dasharray="10,10" style="stroke:rgb(255,0,0);stroke-width:2;" />\n', v0.x*s, v0.y*s, v1.x*s, v1.y*s);
    }
    result += '</svg>\n';
    return result;
}

module.exports = {
    ExportTerminalsToSVG : ExportTerminalsToSVG,
    ExportGraphToSVG     : ExportGraphToSVG
};
