function Vec2(x, y)
{
    this.x = typeof x !== 'undefined' ? x : 0;
    this.y = typeof y !== 'undefined' ? y : 0;
}
Vec2.prototype.add = function(other)
{
    return new Vec2(this.x+other.x, this.y+other.y);
};
Vec2.prototype.equals = function(other)
{
    return (this.x==other.x && this.y==other.y);
};
Vec2.prototype.toString = function()
{
    return JSON.stringify(this);
};

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

module.exports = {
    Vec2 : Vec2,
    AABB : AABB
};
