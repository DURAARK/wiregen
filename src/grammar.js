"use strict";
// simple attributed symbol grammar
//
// ulrich.krispel@vc.fraunhofer.at

var VEC = require('./vec.js');

// -----------------------------------------------------
// Terminals are lowercase
function isTerminal(S)
{
    return S.label.toLowerCase() == S.label;
}

function BB(att)
{
    return new VEC.AABB(new VEC.Vec2(att.left, att.top), 
                    new VEC.Vec2(att.left + att.width, att.top + att.height));
}

function DIFF(value_a, value_b)
{ 
    return Math.abs(value_a - value_b);
}

// need to insert "this.vars."
function prepareStatement(vars, statement)
{
    var s = statement;
    for (var v in vars) {
        if (s.indexOf(v) > -1) {
            s = s.replace(v, "this.vars." + v);
        }
    }
    return s;
}

function evaluateRule(NT, T, G, result)
{
    // context free attributes
    var label = this.label;
    var att;
    if (this.attributes) att = this.attributes;
    else att = {};    
    
    // context sensitive attributes
    var A = this.A;
    var B = this.B;
    
    var didEvaluate = false;
    // a symbol is considered terminal if it is not defined in the grammar
    var dbgtext = label + " => ";
    var rule = G[label];
    // rule is an array of symbols to create
    for (var i = 0; i < this.length; ++i) {
        var rhs = this[i];
        
        // create new symbol, inherit attributes
        var doEvaluate = true;
        if (rhs.hasOwnProperty('vars')) {
            this.vars = {};
            for (var v in rhs.vars) {
                this.vars[v] = eval(prepareStatement(rhs.vars, rhs.vars[v]));
                //var var_definition = "var " + v + " = " + rhs.vars[v] + ";";
                //eval(var_definition);
            }
        }
        if (rhs.hasOwnProperty('condition')) {
            doEvaluate = (eval(prepareStatement(this.vars, rhs.condition)) == true);
        }
        
        if (doEvaluate) {
            var N = {
                "label"      : rhs.label,
                "attributes" : JSON.parse(JSON.stringify(att))
            };
            
            // evaluate attributes
            if (rhs.attributes) {
                for (var attname in rhs.attributes) {
                    N.attributes[attname] = eval(prepareStatement(rhs.vars, rhs.attributes[attname]));
                }
            }
            
            dbgtext += rhs.label + " ";
            if (isTerminal(N)) { T.push(N); }
            else { result.push(N); }
        }
    }

    return didEvaluate;
}

function filterNT(NT, label)
{
    var filtered = [];
    NT.forEach(function (nt) { if (nt.label == label) filtered.push(nt); });
    return filtered;
}


function evaluateGrammarStep(NT, T, G)
{
    var result = [];
    var GrammarEvaluated = true;
    
    var hasCS = false;  
    
    // context sensitive rules
    for (var label in G) {
        var csrule = G[label];
        if (!csrule.hasOwnProperty('eval')) { csrule.eval = evaluateRule; }

        var i = label.indexOf(":");
        if (i >= 0) {
            var lblA = label.substring(0, i);
            var lblB = label.substring(i + 1, label.length);
            
            if (lblA == lblB) {
                var match = filterNT(NT, lblA);
                for (var iA = 0; iA < match.length - 1; ++iA) {
                    for (var iB = iA + 1; iB < match.length; ++iB) {
                        if (match[iA].attributes.wallid == match[iB].attributes.wallid) {
                            csrule.A = match[iA].attributes;
                            csrule.B = match[iB].attributes;
                            csrule.eval(NT, T, G, result);
                        }
                    }
                }
            } else {
                var matchA = filterNT(NT, lblA);
                var matchB = filterNT(NT, lblB);
                if (matchA.length > 0 && matchB.length > 0) {
                    hasCS = true;
                    for (var NTA in matchA) {
                        for (var NTB in matchB) {
                            if (matchA[NTA] != matchB[NTB]) {
                                if (matchA[NTA].attributes.wallid == matchB[NTB].attributes.wallid) {
                                    csrule.A = matchA[NTA].attributes;
                                    csrule.B = matchB[NTB].attributes;
                                    csrule.eval(NT, T, G, result);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // evaluate context free rules only if there have not been any 
    // context sensitive replacements
    if (hasCS == false) {
        NT.forEach(function (lhs) {
            if (lhs.label in G) {
                var rule = G[lhs.label];
                if (!rule.hasOwnProperty('eval')) { rule.eval = evaluateRule; }
                if (rule.eval(NT, T, G)) {
                    GrammarEvaluated = false;
                }
            } else {
                // rule not found
                console.log("[ERROR] Rule %s not found", label);
            }

        }
        );
    }
    return result;
}


module.exports = {
    evaluateGrammarStep : evaluateGrammarStep
};
