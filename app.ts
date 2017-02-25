
import ArgvParser from "./src/ArgumentsParser";
import {Paint} from "./src/Errors";
import RecipeParser from "./src/recipeParser";
import Repository from "./src/repositoryTracker";
// import Promise = require("bluebird")

// global.Promise = Promise;

// import {CustomError} from "./src/Errors"

if(process.env.NODE_ENV == "development"){

	/**
 	* Make console.log verbose with filename and line number indication
 	*/

	const stackTrace = require( "stack-trace ");
	const path = require( "path ");
	const util = require( "util ");

	const realLog = console.log
	// tslint:disable-next-line:only-arrow-functions
	console.log = function(){

	let trace = stackTrace.get();
	trace = trace[this.traceCursor || 1] || trace[0];
	const logput: any = [
			Paint( "%wt_Br ", "@ - line: "
			+ trace.getLineNumber()
			+ " on  "
			+ path.relative(__dirname, trace.getFileName())),
			"\n" ];
	for (const x in arguments) {

		if (typeof arguments[x] ===  "string") {
			logput.push((parseInt(x, 10) > 0 && arguments[x].length > 50 ? "\n " : " ") + arguments[x]);
		}else {

			if (parseInt(x, 10) > 0) {
				logput.push( "\n ");
			}
			logput.push(util.inspect(arguments[x], {colors: true}));
		}
	}

	realLog.apply(null, logput);
	};
}


const recipes = new Repository();
const args = new ArgvParser(process.argv, recipes);
const job = new RecipeParser();
const baseRecipe = recipes.getRecipe(args.getTarget());
if (!baseRecipe) {args.throwArgsError("Specified tetro does not exist"); }
job.load(baseRecipe);
