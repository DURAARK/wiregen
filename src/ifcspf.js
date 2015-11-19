"use strict";

var fs = require('fs');

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf(';');    
    while (index > -1) {
      if (remaining.substring(0,index).split("\'").length % 2 != 0)
      {
      	var line = remaining.substring(0, index).replace('\n','');
      	remaining = remaining.substring(index+1);
      	func(line);
      	index = remaining.indexOf(';');
      } else {
      	index += remaining.substring(index+1).indexOf(';');
      }
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

var HEADER = 
{
	"FILE_DESCRIPTION" : "",
	"FILE_NAME" : "",
	"FILE_SCHEMA" : ""
}

var DATA = 
{
}

var parserstate = "";

function parseIFC(data) {
// parse IFC
//	console.log("line:"  + data);
	switch(data)
	{
		case "ISO-10303-21" :
			parserstate = "BEGIN";
		break;
		case "HEADER" :
		if (parserstate == "BEGIN") {
			console.log("* enter header section");
			parserstate="HEADER";
		}
		break;
		case "DATA" :
		if (parserstate == "HEADER") {
			console.log("* enter data section");
			parserstate="DATA";
		}
		break;
		default:
		console.log("parsing " + data);
		switch(parserstate) {
			case "HEADER" :
			break;
			case "DATA" :
			break;
		}
	}
}

var input = fs.createReadStream('test1.ifc');
readLines(input, parseIFC);

