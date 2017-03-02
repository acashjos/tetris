
import * as Promise from "bluebird";
import * as path from "path";
import * as stackTrace from "stack-trace";
import * as util from "util";
import ArgvParser from "./src/ArgumentsParser";
import {Paint} from "./src/Errors";
import RecipeParser from "./src/recipeParser";

// import Promise from "bluebird"

global.Promise = Promise;

// import {CustomError} from "./src/Errors"

if(process.env.NODE_ENV == "development"){

	/**
 	* Make console.log verbose with filename and line number indication
 	*/


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


export default class Main {

	constructor() {

		const args = new ArgvParser(process.argv);
		const job = new RecipeParser(args);
		job.load();

	}
}
