var path = require('path'); 
var fs = require("fs");
var rootPath = __filename ;  
var current_dir = path.dirname(rootPath);
var lastParentDir="";
var n="";

renameFilesInDir(current_dir);

function changeFileName(filepath){
    fs.stat(filepath,function(err,stats){
        if (err) {
            console.log(err);
            return;
        }
        if(stats.isFile()){
            var filename = path.basename(filepath);//filename 
            var parentDir = path.dirname(filepath);//directory

            var parentDirname = path.basename(path.dirname(filepath));//foldername
            var thisFilename = path.basename(__filename);//this file name : nameAfterParent2.js
            if(lastParentDir != parentDir){
                n=1;
                if (filename != thisFilename){
                    var fileFormat = filename.split(".");
                    var newName = parentDirname + "-" + n + "." + fileFormat[fileFormat.length - 1];
                    var newPath = parentDir+"\\"+newName;
                    console.log("going to rename from "+filepath+" to "+newPath);
                    fs.rename(filepath,newPath);
                    n++;
                    lastParentDir = parentDir;
                }
            }
            else{
                if (filename != thisFilename){
                    var fileFormat = filename.split(".");
                    var newName = parentDirname + "-" + n + "." + fileFormat[fileFormat.length - 1];
                    var newPath = parentDir+"\\"+newName;
                    console.log("going to rename from "+filepath+" to "+newPath);
                    fs.rename(filepath,newPath);
                    n++;
                    lastParentDir = parentDir;
                }
            }
        }else if(stats.isDirectory()){
            console.log("============["+filepath+"] isDir===========");
            renameFilesInDir(filepath);
        }else{
        console.log("unknown type of file");
        }
    });
}

function renameFilesInDir(dir){
    fs.readdir(dir, function(error,files){
        if (error){
          console.log(error.stack);
          return;
        }
        var len = files.length;
        var file;
        for(var i=0; i<len ;i++ ){
            file = files[i]; 
            changeFileName(dir+"\\"+file);
        }
    });
}
