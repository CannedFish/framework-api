var netIface = require("os").networkInterfaces(),
  requireProxy = require('../../../../app/demo-rio/sdk/lib/requireProxy').requireProxySync,
  dataTransProxy = requireProxy("datatransfer"),
  clipboardProxy = requireProxy("clipboard");


/* @method getString
 *  get the string data from clipboard
 */
exports.getText = function(callback) {
  clipboardProxy.paste(function(ret) {
    if (ret.err) {
      console.log("Error: " + ret.err);
      callback(ret.err);
    } else {
      var txt = ret.ret;
      callback(txt);
    }

  });
}

/* @method getFile
 *  @para dstPath:detination to store file
 *     e.g:[dstIP:]path_to_destination_file
 *  get file by using the path on the clipboard
 */
exports.getFile = function(callback, dstPath) {
  if(typeof(callback) != 'function' ){
    throw "getFile: the first parameter must be funcion!";
  }
  clipboardProxy.paste(function(ret) {
    if (ret.err) {
      console.log("Error: " + ret.err);
      callback(ret.err);
      return;
    } else {
      var srcPath = "",
        _dstPath = dstPath;
      if(!ret.ret)
      {
        ret.err="ret.ret is null";
        callback(ret.err);
        return;
      }
      ret.ret = ret.ret.split("path:")[1];
      if(!ret.ret)
      {
        ret.err="path not in ret.ret ";
        callback(ret.err);
        return;
      }
              
      console.log(ret.ret);
      srcPath = ((ret.ip == '') ? ret.ret : (ret.ip + ':' + ret.ret));
      if (_dstPath[_dstPath.length - 1] == '/') {
        var subString = ret.ret.split('/');
        _dstPath = dstPath + subString[subString.length-1];
      }
      console.log("srcPath="+srcPath+",_dstPath="+_dstPath);

      dataTransProxy.cpFile(srcPath,_dstPath,function(ret) {
        if(ret.err) {
          callback(ret.err);
          return;
        }
        var sessionID = ret.ret;
        var session = dataTransProxy;
        if(session.err){
          var err;
          if(typeof session.err === 'string') {
            err = session.err;
          } else if(typeof session.err === 'object') {
            err = session.err.code + ', ' + session.err.path;
          }
          callback(err);
          return;
        }
        session.on('end#' + sessionID, function(err){
          if(err){
            callback(err);
            return;
          }
          callback(null, {
            id: sessionID
          }, _dstPath);
        })

        // cancel test
        // setTimeout(function() {
          // dataTransProxy.cancel(sessionID, function(ret) {
            // // if(ret.err) return console.log(ret.err);
            // // console.log('File transmission canceled .');
            // callback(ret, _dstPath);
          // });
        // }, 2000);
      });
    }
  });
}

/* @method setText
 *  copy string to clipboard
 *  @para data: string,file
 *  @para callback: function to handle the reslut of doCopy()
 */
exports.setText = function(string, callback) {
  var _text = "text:" + string;
  clipboardProxy.copy(_text, function(err) {
    if (err.err) {
      callback(err.err);
    } else {
      callback({});
    }
  });
}

/* @method setFile
 *  copy directory of a file to clipboard
 *  @para path: directory of source file
 */
exports.setFile = function(path, callback) {
  var _path = "path:" + path;
  clipboardProxy.copy(_path, function(err) {
    var _err = err.err;
    if (_err) {
      console.log("Error: " + _err);
      callback(_err);
    } else {
      callback(null);
    }
  });
}
