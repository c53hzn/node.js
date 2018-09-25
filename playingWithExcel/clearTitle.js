var path = require('path'); 
var fs = require("fs");
var xlsx = require('node-xlsx');
var CSV = require('csv-string');
var rootPath = __filename ;  
var current_dir = path.dirname(rootPath);

traverseDir(current_dir);

function processFile(thePath,theName){
	var rawData;
    	
    //读取文件内容
	var fileNameArr = theName.split(".");
	var fileFormat = fileNameArr[fileNameArr.length - 1];
    if(fileFormat.match(/xls(x)?/i)){
        var sheets = xlsx.parse(thePath+"\\"+theName);
	    rawData = sheets[0].data;//rawData是obj
        processData(rawData);
    }else if(fileFormat.match(/csv/i)){
        fs.readFile(thePath+"\\"+theName, function (err, data) {
            if (err) {
                console.log(err.stack);
                return;
            }
            rawData = CSV.parse(String(data));
            processData(rawData);
        }); 
    }
    
    //处理文件内容
    function processData(rawData){
        var data = [];//最后输出的内容
        var title = {"first":[],"second":[]};
        var rowID = "";//存放上一行rowID的辅助变量

        for(var i in rawData){
            var arr=[];
            let line=rawData[i];//一行内容，这是个arr，如果用for(var j in line)会漏掉空单元格
            for(var j = 0; j < line.length; j++){
                var cell = String(line[j]);//单元格内的值必须转成字符串
                arr.push(cell);
            }
            if(i == 0){
                title.first = arr;
                data.push(arr);
            }else{
                if(arr[0] != title.first[0]){
                    data.push(arr);
                }
            }
        }

        var newFileName;
        var buffer;
        if(fileFormat.match(/xls(x)?/)){
            buffer = xlsx.build([
                {
                    name:'rawData',
                    data:data
                }        
            ]);
        }else if(fileFormat.match(/csv/)){
            buffer = CSV.stringify(data);
        }

        //生成文件
        var regExp = /\.xls(x)?$/;
        var newExtent = theName.replace(regExp,".xlsx");
        newFileName = "Done-" + newExtent;
        fs.writeFileSync(thePath + "\\" + newFileName,buffer,{'flag':'w'});
        console.log(thePath + "\\" + newFileName + " created");
    }  
}

function fileOrDir(filepath){
    fs.stat(filepath,function(err,stats){
        if (err) {
            console.log(err);
            return;
        }
        if(stats.isFile()){
            var filename = path.basename(filepath);//filename 
            var parentDir = path.dirname(filepath);//directory

            var fileFormat = filename.split(".");
            if(fileFormat[fileFormat.length - 1].match(/(xls(x)?|csv)/i)){
                processFile(parentDir,filename);
            }
        }else if(stats.isDirectory()){
            console.log("======["+filepath+"] isDir=====");
            traverseDir(filepath);
        }else{
            console.log("unknown type of file");
        }
    });
}

function traverseDir(dir){
    fs.readdir(dir, function(error,files){
        if (error){
          console.log(error.stack);
          return;
        }
        var len = files.length;
        var file;
        for(var i=0; i<len ;i++ ){
            file = files[i]; 
            fileOrDir(dir+"\\"+file);
        }
    });
}
