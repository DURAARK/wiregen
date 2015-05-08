
var util = require('util');

function Vec2(x, y)
{
    this.x = typeof x !== 'undefined' ? x : 0;
    this.y = typeof y !== 'undefined' ? y : 0;
}
Vec2.prototype.add = function(other)
{
    return new Vec2(this.x+other.x, this.y+other.y);
}

function AABB(bbmin, bbmax)
{
    this.bbmin = typeof bbmin !== 'undefined' ? bbmin : new Vec2(Number.MAX_VALUE,Number.MAX_VALUE);
    this.bbmax = typeof bbmax !== 'undefined' ? bbmax : new Vec2(Number.MIN_VALUE,Number.MIN_VALUE);
}
AABB.prototype.insert = function(x,y)
{
    if (x<this.bbmin.x) this.bbmin.x=x;
    if (x>this.bbmax.x) this.bbmax.x=x;
    if (y<this.bbmin.y) this.bbmin.y=y;
    if (y>this.bbmax.y) this.bbmax.y=y;
};
AABB.prototype.width  = function() { return this.bbmax.x-this.bbmin.x; };
AABB.prototype.height = function() { return this.bbmax.y-this.bbmin.y; };

// returns svg string
function ExportTerminalsToSVG(symbols)
{
    // get bounding box
    var bb = new AABB();
    symbols.forEach(function (symbol)
    {
        var att = symbol.attributes;
        bb.insert(att.left,att.top);
        bb.insert(att.left+att.width,att.top+att.height);
    });

    var result = util.format('<svg width="%s" height="%s" version="1.1" xmlns="http://www.w3.org/2000/svg">\n', bb.width(), bb.height());

    // draw bounding box
    result += util.format('<rect width="%d" height="%d" style="fill:rgb(240,240,240);stroke-width:3;stroke:rgb(0,0,0)" />\n', bb.width(), bb.height());

    symbols.forEach(function (symbol)
    {
        var att = symbol.attributes;

        switch(symbol.label)
        {
            case "hzone":
                result += util.format('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke-dasharray="10,10" style="stroke:rgb(255,0,0);stroke-width:2;" />\n', 0, att.pos, bb.width(), att.pos);
                break;
            case "vzone":
                result += util.format('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke-dasharray="10,10" style="stroke:rgb(255,0,0);stroke-width:2;" />\n', att.pos, 0, att.pos, bb.height());
                break;
            case "door":
                result += util.format('<rect x="%d" y="%d" width="%d" height="%d" style="fill:rgb(200,200,100);stroke-width:3;stroke:rgb(0,0,0)" />\n', att.left, att.top, att.width, att.height);
                break;
            case "socket":
                result += util.format('<rect x="%d" y="%d" width="%d" height="%d" style="fill:none;stroke-width:3;stroke:rgb(0,200,0)" />\n', att.left, att.top, att.width, att.height);
                break;
            case "switch":
                result += util.format('<rect x="%d" y="%d" width="%d" height="%d" style="fill:none;stroke-width:3;stroke:rgb(0,0,200)" />\n', att.left, att.top, att.width, att.height);
                break;
        }
    });

    result += '</svg>\n';

    return result;
}

module.exports = {
    ExportTerminalsToSVG : ExportTerminalsToSVG
};
