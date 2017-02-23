
import path=require('path')
import Repository from './repositoryTracker'
import {Paint} from "./Errors"
// console.log(input)

enum Actions{
	create, remove
}

export default class ArgumentsParser{
	rawInputs: string[]
	target: string
	action: Actions = Actions.create

	constructor(input: string | string[],public repository: Repository, argvOffset?: number){
		if(typeof input == "string") input = input.split(' ').filter( x => !!x)
		this.rawInputs = input

		//Identify action
		argvOffset = argvOffset || 2; // skip `argvOffset` params from begining
		switch(this.rawInputs[argvOffset]){
			case "--help" :
			case "-h"     : this.printHelp(); break;
			
			case "--remove":
			case "-r"     : this.action = Actions.remove
			                argvOffset++; break;
			
			default       : if(/^-/.test(this.rawInputs[argvOffset])) this.throwArgsError() 
		}
		
		if(!this.rawInputs[argvOffset]) this.throwArgsError() 
		this.target = this.rawInputs[argvOffset];

		/*if(this.rawInputs.length<4)
			throw("wrong syntax")

		var flags= this.rawInputs[2]
		var dir
		var tetro= this.rawInputs[4]

		if(!tetro){
			dir=process.cwd()
			tetro=this.rawInputs[3]
		}
		else 
			dir=path.resolve(process.cwd(),this.rawInputs[3])

		// console.log(process.cwd(),this.rawInputs[3],path.resolve(process.cwd(),this.rawInputs[3]))
		flags=flags.replace(/^-/,'')



		if(dir==path.resolve(dir,'../')+'/'+tetro)
			console.log('included')
		else
			dir=dir+'/'+tetro
		try{
			console.log(fs.statSync(dir))	
		}
		catch(e){
			fs.mkdirSync(dir);
		}*/

	}

	getTarget(): string{
		return this.target;
	}

	printHelp(){
		let out = Paint(`\n%bu_Br   Prints this section\n\n`,'--help   -h')
		out += Paint(`%bu_Br   \n`,'{recipeName} [param1 [param2 [...]  ]')
		out += Paint(`              Runs a tetro injection\n\n`)
		out += Paint(`%bu_Br   \n`,'--revert   -r {recipeName}')
		out += `              Reverts a tetro injection\n`
		out += `              This will throw an error of the tetro doesn't have a revert strategy\n`
		console.log(out)
		process.exit(0)
	}

	throwArgsError(msg?: string){
		let out = msg||"unknown operation!! please try any of the following"
		console.log(Paint("%rd_Br",out))
		if(process.env.NODE_ENV == "development"){
			console.trace(Paint("%rd_Br",out))
		}
		if(!msg)this.printHelp();
		process.exit(0)
	}
}

	