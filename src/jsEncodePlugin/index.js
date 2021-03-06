
const fs = require('fs');
const path = require('path');
var chalk = require('chalk')
function JsEncodePlugin(pluginOptions) {
  this.options = pluginOptions;
}

JsEncodePlugin.prototype.apply = function (compiler) {
  const _this = this;
  compiler.plugin('after-emit', function (compilation, callback) {
      console.log(chalk.cyan('\n jsencode start.\n'))
      var filePath = path.resolve(__dirname, _this.options.assetsPath);//设置需要加密的js文件路径，_this.options.assetsPath为插件配置中传过来的需要加密的js文件路径
      filterFile(filePath);
      function filterFile(fp){
        fs.readdir(fp, (err, files)=>{
          if(err){
            console.log(chalk.yellow(
              '读取js文件夹异常：\n' +
              err.message + '\n'
            ))
            return;
          }
          files.forEach((filename)=>{
            if(_this.options.jsReg.test(filename)){
              var filedir = path.resolve(fp, filename);
              fs.readFile(filedir, 'utf-8', (err, data)=>{
                if(err){
                  console.log(chalk.yellow(
                    '读取js文件异常：\n' +
                    err.message + '\n'
                  ))
                  return;
                }
                let result = jjencode(_this.options.global, data);
                fs.writeFile(filedir, result, (err)=>{
                  if(err){
                    console.log(chalk.yellow(
                      '写入加密后的js文件异常：\n' +
                      err.message + '\n'
                    ))
                    return;
                  }
                  console.log(chalk.cyan('  jsencode complete.\n'))
                })
              })
            }
          })
        })
      }
      //js加密函数
      function jjencode( gv, text )
			{
				var r="";
				var n;
				var t;
				var b=[ "___", "__$", "_$_", "_$$", "$__", "$_$", "$$_", "$$$", "$___", "$__$", "$_$_", "$_$$", "$$__", "$$_$", "$$$_", "$$$$", ];
				var s = "";
				for( var i = 0; i < text.length; i++ ){
					n = text.charCodeAt( i );
					if( n == 0x22 || n == 0x5c ){
						s += "\\\\\\" + text.charAt( i ).toString(16);
					}else if( (0x20 <= n && n <= 0x2f) || (0x3A <= n == 0x40) || ( 0x5b <= n && n <= 0x60 ) || ( 0x7b <= n && n <= 0x7f ) ){
						s += text.charAt( i );
					}else if( (0x30 <= n && n <= 0x39 ) || (0x61 <= n && n <= 0x66 ) ){
						if( s ) r += "\"" + s +"\"+";
						r += gv + "." + b[ n < 0x40 ? n - 0x30 : n - 0x57 ] + "+";
						s="";
					}else if( n == 0x6c ){ // 'l'
						if( s ) r += "\"" + s + "\"+";
						r += "(![]+\"\")[" + gv + "._$_]+";
						s = "";
					}else if( n == 0x6f ){ // 'o'
						if( s ) r += "\"" + s + "\"+";
						r += gv + "._$+";
						s = "";
					}else if( n == 0x74 ){ // 'u'
						if( s ) r += "\"" + s + "\"+";
						r += gv + ".__+";
						s = "";
					}else if( n == 0x75 ){ // 'u'
						if( s ) r += "\"" + s + "\"+";
						r += gv + "._+";
						s = "";
					}else if( n < 128 ){
						if( s ) r += "\"" + s;
						else r += "\"";
						r += "\\\\\"+" + n.toString( 8 ).replace( /[0-7]/g, function(c){ return gv + "."+b[ c ]+"+" } );
						s = "";
					}else{
						if( s ) r += "\"" + s;
						else r += "\"";
						r += "\\\\\"+" + gv + "._+" + n.toString(16).replace( /[0-9a-f]/gi, function(c){ return gv + "."+b[parseInt(c,16)]+"+"} );
						s = "";
					}
				}
				if( s ) r += "\"" + s + "\"+";
 
				r = 
				gv + "=~[];" + 
				gv + "={___:++" + gv +",$$$$:(![]+\"\")["+gv+"],__$:++"+gv+",$_$_:(![]+\"\")["+gv+"],_$_:++"+
				gv+",$_$$:({}+\"\")["+gv+"],$$_$:("+gv+"["+gv+"]+\"\")["+gv+"],_$$:++"+gv+",$$$_:(!\"\"+\"\")["+
				gv+"],$__:++"+gv+",$_$:++"+gv+",$$__:({}+\"\")["+gv+"],$$_:++"+gv+",$$$:++"+gv+",$___:++"+gv+",$__$:++"+gv+"};"+
				gv+".$_="+
				"("+gv+".$_="+gv+"+\"\")["+gv+".$_$]+"+
				"("+gv+"._$="+gv+".$_["+gv+".__$])+"+
				"("+gv+".$$=("+gv+".$+\"\")["+gv+".__$])+"+
				"((!"+gv+")+\"\")["+gv+"._$$]+"+
				"("+gv+".__="+gv+".$_["+gv+".$$_])+"+
				"("+gv+".$=(!\"\"+\"\")["+gv+".__$])+"+
				"("+gv+"._=(!\"\"+\"\")["+gv+"._$_])+"+
				gv+".$_["+gv+".$_$]+"+
				gv+".__+"+
				gv+"._$+"+
				gv+".$;"+
				gv+".$$="+
				gv+".$+"+
				"(!\"\"+\"\")["+gv+"._$$]+"+
				gv+".__+"+
				gv+"._+"+
				gv+".$+"+
				gv+".$$;"+
				gv+".$=("+gv+".___)["+gv+".$_]["+gv+".$_];"+
				gv+".$("+gv+".$("+gv+".$$+\"\\\"\"+" + r + "\"\\\"\")())();";
				//console.log(r);
				return r;
			}
      callback();
  });
};


module.exports =JsEncodePlugin;