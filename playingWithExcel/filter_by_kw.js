var path = require('path');
var fs = require("fs");
const csv2json = require('csvjson-csv2json');
const json2csv = require('csvjson-json2csv');
var rootPath = __filename;
var current_dir = path.dirname(rootPath);

processFile(current_dir, "keyword.csv", "data.csv");

function processFile(thePath, kw_csv, data_csv) {
	fs.readFile(thePath + "\\" + kw_csv, function (err, data) {
		if (err) {
			console.log(err.stack);
			return;
		}
		var kw_arr = [];
		var kw_json = csv2json(String(data));//json array [{a: 1}, {a: 2}, {a: 3}, {a: 4}]
		var kw_header_arr = [];
		for (let key in kw_json[0]) {
			kw_header_arr.push(key);
		}
		for (let j = 0; j < kw_json.length; j++) {
			kw_arr.push(kw_json[j][kw_header_arr[0]].toLowerCase());
		}
		processData(kw_arr);
	});

	function processData(kw) {
		fs.readFile(thePath + "\\" + data_csv, function (err, data) {
			var output_arr = [];
			if (err) {
				console.log(err.stack);
				return;
			}
			//json array [{a: 1, b: 2}, {a: 3, b: 4}]
			var rawData = csv2json(String(data), {
				parseNumbers: true
			});
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
			fs.writeFileSync(__dirname + "\\" + "report.csv", output, {
				'flag': 'w'
			});
		});
	}
}
