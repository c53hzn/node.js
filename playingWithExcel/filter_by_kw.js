var path = require('path');
var fs = require("fs");
const csv2json = require('csvjson-csv2json');
const json2csv = require('csvjson-json2csv');
var rootPath = __filename;
var current_dir = path.dirname(rootPath);

processFile(current_dir, "keyword.csv", ["data.csv"]);

function processFile(thePath, kw_csv, data_csv_arr) {
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
			kw_arr.push(String(kw_json[j][kw_header_arr[0]]).toLowerCase());
		}
		for (let l = 0; l < data_csv_arr.length; l++) {
			processData(kw_arr, data_csv_arr[l]);
		}
	});

	function processData(kw, data_csv) {
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
					output_arr.push(rawData[i]);//如果没中的也需要导出的话就放外面
				}
				console.log("Row " + i + " is done");
			}
			var output = json2csv(output_arr);
			var csv_name = data_csv.replace(/\.csv$/, "");
			fs.writeFileSync(__dirname + "\\" + "report_" + csv_name +fullDate() + ".csv", output, {
				'flag': 'w'
			});
		});
	}
}

function fullDate(){
    function addZero(a){
		if(a < 10){
			return "0" + a;
		}else{
			return a;
		}
	}
    var timeNew = new Date();
    var year = timeNew.getFullYear();
    var month = addZero(timeNew.getMonth() + 1);
    var date = addZero(timeNew.getDate());
    return year + "-" + month + "-" + date;
}
