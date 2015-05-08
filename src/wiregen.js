#!/usr/bin/env node

var fs=require('fs')
var path=require('path')
var pkg=require( path.join(__dirname, 'package.json') );

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

var svg=svgexport.ExportTerminalsToSVG(TerminalSymbols);
fs.writeFileSync("result.svg", svg);

var v = new graph.Vertex();
