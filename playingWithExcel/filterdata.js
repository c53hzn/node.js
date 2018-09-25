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
        var rowID = "";//存放上一行rowID的辅助变量
        var isNeeded = {"0":{"colNew":0}};
        var isEANpresent = false;
        var isUPCpresent = false;

        for(var i in rawData){
            var arr=[];
            let line=rawData[i];//一行内容，这是个arr，如果用for(var j in line)会漏掉空单元格
            for(var j = 0; j < line.length; j++){
                var cell = "";
                //单元格内的值必须转成字符串
                if(line[j] || line[j] == 0){
                    cell = String(line[j]);
                }
                if(i == 0){//判断excel的栏位名
                    switch(cell){
                        case "dsheet_product_code":
                            isNeeded[j] = {};
                            isNeeded[j].colNew = 1;
                            break;
                        case "dsheet_var_ean":
                            isNeeded[j] = {};
                            isNeeded[j].colNew = 2;
                            isEANpresent = true;
                            break;
                        case "dsheet_var_upc":
                            isNeeded[j] = {};
                            isNeeded[j].colNew = 3;
                            isUPCpresent = true;
                            break;
                        case "dsheet_catalog_type":
                            isNeeded[j] = {};
                            isNeeded[j].colNew = 4;
                            break;
                        case "dsheet_catalog_id":
                            isNeeded[j] = {};
                            isNeeded[j].colNew = 5;
                            break;
                    }
                }
                /*填充rowID开始*/
                if(i > 1 && j == 0 ){//从第三行开始，如果为空，则使用上一行的rowID
                    if(cell != ""){
                        rowID = cell;//不为空则辅助值等于单元格值
                    }else{
                        cell = rowID;//单元格为空则填充辅助值
                    }
                }
                /*填充rowID结束*/
                if(isNeeded[j]){//只要rowID、主SKU、子SKU、EAN、UPC、catalog_type、catalog_id
                    arr[isNeeded[j].colNew] = cell;
                }
            }
            if(isEANpresent && (/[^0-9]/.test(arr[2]) || arr[2].length == 0) && arr[4] == "EAN" && arr[5]){
                arr[2] = arr[5];
            }
            if(isUPCpresent && (/[^0-9]/.test(arr[4]) || arr[4].length == 0) && arr[4] == "UPC" && arr[5]){
                arr[3] = arr[5];
            }

            /*如果文件里沒有EAN或UPC，则处理空栏*/
            if(!isEANpresent && !isUPCpresent){
                arr.splice(2,2);
            }else if(!isEANpresent){
                arr.splice(2,1);
            }else if(!isUPCpresent){
                arr.splice(3,1);
            }
            /*处理空栏*/

            arr.splice(arr.length-2,2);//拿掉catalog_type和catalog_id
            data.push(arr);
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
        if(!isEANpresent || !isUPCpresent){//用户一开始就没有导出var_UPC或var_EAN，不应修改
            newFileName = "Done-partially-" + newExtent;
        }else{
            newFileName = "Done-" + newExtent;
        }
        fs.writeFileSync(<target path> + newFileName,buffer,{'flag':'w'});
        console.log(<target path> + newFileName + " created");
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
