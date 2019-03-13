var path = require('path'); 
var fs = require("fs");
var CSV = require('csv-string');
const csv2json = require('csvjson-csv2json');
const json2csv = require('csvjson-json2csv');
var rootPath = __filename ;  
var current_dir = path.dirname(rootPath);

processFile(current_dir,"keyword.csv", "data.csv");
function processFile(thePath,kw_csv, data_csv){
	fs.readFile(thePath+"\\"+kw_csv, function (err, data) {
	    if (err) {
	        console.log(err.stack);
	        return;
	    }
	    var kw_arr = CSV.parse(String(data));//two dimension array
	    
	    kw_arr.shift();
	    for (let j = 0; j < kw_arr.length; j++) {
	    	kw_arr[j] = kw_arr[j][0].toLowerCase();
	    }
	    processData(kw_arr);
	});

	function processData(kw) {
		fs.readFile(thePath+"\\"+data_csv, function (err, data) {
			var output_arr = [];
		    if (err) {
		        console.log(err.stack);
		        return;
		    }
		    var rawData = csv2json(String(data), {parseNumbers: true});//json array [{a: 1, b: 2}, {a: 3, b: 4}]
		    var dynamicHeader = [];
		    for (let i = 0; i < rawData.length; i++) {
		    	let text = " ";
	    		for (let k in rawData[i]) {
	    			text += String(rawData[i][k]).toLowerCase() + " ";
	    		}
	    		let pureText = text.replace(/(\[|\]|\{|\}|\-|\(|\)|\"|:|,|\/)/g, " ");

				let pureTextSimplified = pureText.replace(/\s{2,}/, " ");
				
				let kw_matched = [];
				for (let j = 0; j < kw.length; j++) {
					if (pureTextSimplified.indexOf(" " + kw[j] + " ") != -1) {
						kw_matched.push(kw[j]);
					}
				}
				if (kw_matched.length) {
					let kw_matched_str = kw_matched.join(",");
					rawData[i]["matched"] = kw_matched_str;
					output_arr.push(rawData[i]);
				}
			    console.log("line " + i + " is done");
		    }
		    var output = json2csv(output_arr);
		    fs.writeFileSync(__dirname + "\\" + "report.csv",output,{'flag':'w'});
		});
	}
}




