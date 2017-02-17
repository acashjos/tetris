import fs=require('fs')
import path=require('path')
console.log('_____________________________________',name)
// console.log(process.argv)

if(process.argv.length<4)
	throw("wrong syntax")

var flags= process.argv[2]
var dir
var recipe= process.argv[4]

if(!recipe){
	dir=process.cwd()
	recipe=process.argv[3]
}
else 
	dir=path.resolve(process.cwd(),process.argv[3])

// console.log(process.cwd(),process.argv[3],path.resolve(process.cwd(),process.argv[3]))
flags=flags.replace(/^-/,'')



	if(dir==path.resolve(dir,'../')+'/'+recipe)
		console.log('included')
	else
		dir=dir+'/'+recipe
	try{
		console.log(fs.statSync(dir))	
	}
	catch(e){
		fs.mkdirSync(dir);
	}
	






function ff(recipe){}