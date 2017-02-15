var fs=require('fs')
var path=require('path')
var Yaml = require('js-yaml')
console.log('_____________________________________')
// console.log(process.argv)

if(process.argv.length<4)
	throw("wrong syntax")

var flags= process.argv[2]
var dir
var name= process.argv[4]

if(!name){
	dir=process.cwd()
	name=process.argv[3]
}
else 
	dir=path.resolve(process.cwd(),process.argv[3])

// console.log(process.cwd(),process.argv[3],path.resolve(process.cwd(),process.argv[3]))
flags=flags.replace(/^-/,'')



	if(dir==path.resolve(dir,'../')+'/'+name)
		console.log('included')
	else
		dir=dir+'/'+name
	try{
		console.log(fs.statSync(dir))	
	}
	catch(e){
		fs.mkdirSync(dir);
	}
	






