#!/usr/bin/env node

var fs=require('fs')
var path=require('path')
var pkg=require( path.join(__dirname, 'package.json') );

// -----------------------------------------------------
function readJSON(filename)
{
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}

// -----------------------------------------------------
function evaluateGrammarStep(symbols, grammar)
{
    var result = [];
    symbols.forEach(function (lhs)
        {
            var att = lhs.attributes;
            var newsymbol;

            // a symbol is considered terminal if it is not defined in the grammar
            if (lhs.label in grammar)
            {
                var dbgtext=lhs.label + " => ";
                var rule = grammar[lhs.label];
                // rule is an array of symbols to create
                rule.forEach( function(rhs)
                {
                    // inherit attributes
                    newsymbol = {
                        "label" : rhs.label,
                        "attributes" : JSON.parse(JSON.stringify(att))
                    };

                    // evaluate attributes
                    if ('attributes' in rhs)
                        Object.keys(rhs.attributes).forEach(function (attname, attid)
                        {
                           newsymbol.attributes[attname] = eval(rhs.attributes[attname]);
                        } );
                    console.log(rhs.label + " " + JSON.stringify(newsymbol.attributes));

                    dbgtext += rhs.label + " ";
                } );
                console.log(dbgtext);
            } else {
                // terminal is just copied
                newsymbol = lhs;
            }
            result.push(newsymbol);
        }
    );
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
var entities = readJSON(program.input);
console.log('parsed %d entities', entities.length);

// read installation zone grammar
console.log('reading installation zone grammar from %s', program.grammar);
var grammar = readJSON(program.grammar);
console.log('parsed %d grammar rules', Object.keys(grammar).length);

// evaluate the grammar

currentsymbols = evaluateGrammarStep(entities, grammar);
console.log(currentsymbols);
