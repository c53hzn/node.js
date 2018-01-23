var path = require('path'); 
var fs = require("fs");
var xlsx = require('node-xlsx');
var rootPath = __filename ;  
var current_dir = path.dirname(rootPath);

traverseDir(current_dir);

function toClear(thePath,theName){
    //读取文件内容
    var obj = xlsx.parse(thePath+"\\"+theName);
    var excelObj=obj[0].data;//只获取第一个sheet的内容
    var data = [];
    for(var i in excelObj){
        var arr=[];
        var value=excelObj[i];//一行内容
        for(var j in value){
            //单元格内的值必须转成字符串之后才能用replace
            var newVal = String(value[j]);
            //保留图片、段落、空行、表格、有序和无序列表，其他标签全部清除
            var noTagTxt = newVal.replace(/<\/?(?!img|\/?p|br|\/?table|\/?tbody|\/?tr|\/?th|\/?td|\/?ul|\/?ol|\/?li)[^>]+>/gm,"");
            //清除所有的style，如果不是用style写的则会保留
            var noStyleTxt = noTagTxt.replace(/\sstyle=\"[^(<|>)]+\"/gm,"");
            arr.push(noStyleTxt);
        }
        data.push(arr);
    }
    var buffer = xlsx.build([
        {
            name:'sheet1',
            data:data
        }        
    ]);
    var regExp = /\.xls(x)?$/;
    var newExtent = theName.replace(regExp,".xlsx");
    var newFileName = "cleared-" + newExtent;
    //将文件内容插入新的文件中
    fs.writeFileSync(thePath+"\\"+newFileName,buffer,{'flag':'w'});
    console.log(thePath+"\\"+newFileName + " created");
}

function clearTag(filepath){
    fs.stat(filepath,function(err,stats){
        if (err) {
            console.log(err);
            return;
        }
        if(stats.isFile()){
            var filename = path.basename(filepath);//filename 
            var parentDir = path.dirname(filepath);//directory

            var fileFormat = filename.split(".");
            if(fileFormat[fileFormat.length - 1].match(/xls(x)?/)){
                toClear(parentDir,filename);
            }
        }else if(stats.isDirectory()){
            console.log("======["+filepath+"] isDir=====");
            traverseDir(filepath);
        }else{
        	console.log("unknown type of file");//既不是文件也不是文件夹
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
            clearTag(dir+"\\"+file);
        }
    });
}
