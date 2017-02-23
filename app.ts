
import Repository from  "./src/repositoryTracker"
import RecipeParser from "./src/recipeParser";
import ArgvParser from "./src/ArgumentsParser";
import {Paint} from "./src/Errors"
// import Promise = require("bluebird")

// global.Promise = Promise;

// import {CustomError} from "./src/Errors"

if(process.env.NODE_ENV == "development"){

	/**
	 * Make console.log verbose with filename and line number indication
	 */
	
	var stackTrace = require('stack-trace');
	var path = require('path')
	const util = require('util');

	var realLog = console.log
	console.log = function(){

	var trace = stackTrace.get();
	trace = trace[this.traceCursor || 1] || trace[0]
	var logput: any=[Paint('%wt_Br','@ - line:'+trace.getLineNumber()+' on '+path.relative(__dirname,trace.getFileName())),'\n' ]
	for(var x in arguments){

	  if(typeof arguments[x] == 'string')
	    logput.push((parseInt(x)>0 && arguments[x].length>50?'\n':'')+arguments[x])

	  else{

	    if(parseInt(x)>0)
	    	logput.push('\n')
	    logput.push(util.inspect(arguments[x],{colors:true})) 
	  }
	}
	
	realLog.apply(null,logput)
	}
}


let recipes = new Repository();
let args = new ArgvParser(process.argv, recipes)
let job = new RecipeParser();
let baseRecipe = recipes.getRecipe(args.getTarget())
if(!baseRecipe) args.throwArgsError("Specified tetro does not exist")
job.load(baseRecipe);
