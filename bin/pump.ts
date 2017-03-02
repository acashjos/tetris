
import Main from "../app";
import {Paint} from "../src/Errors";
import Repository from "../src/repositoryTracker";

// import ArgumentsParser from "../src/ArgumentsParser";

interface IargumentDiscriptor{
	action: Function;
	help: string|Array<string>;
	aliases?: Array<string>;
}
const command = process.argv[2]
const argSignature: {[key: string]: IargumentDiscriptor} = {

	"--help": {
		action: printHelp,
		aliases: ["-h"],
		help: "Prints this section",
	},



	"in": {
		action: ()=> {
			new Main();
		},
		help: ["in {recipeName} [param1 [param2 [...]  ]", "Renders a recipe and injects."]
	},

	"list": {
		action: Repository.printList,
		help: "Prints list of all available recipes",
	},
	"out": {
		action: ()=> {
			new Main();
		},
		help: ["out {recipeName}",
			"Reverts a tetro injection\n",
			"This will throw an error if the tetro doesn't have a revert strategy",
		],
	},
	"test": {
		action: ()=>{ Repository.test(process.argv[3]); },
		help: ["{recipe-name}", "Validates the specified recipe"]
	},
};




function printHelp(){

	let segLengths: Array<number> = Object.keys(argSignature).reduce( (residue,item) => {
		residue[0] =  Math.max(residue[0],item.length);
		argSignature[item].aliases = argSignature[item].aliases || [];
		residue[1] =  Math.max(residue[0],argSignature[item].aliases.join(", ").length );
		let curlen  = typeof argSignature[item].help === "string" ?
			argSignature[item].help.length : argSignature[item].help[0].length;
		residue[2] = Math.max(residue[2], curlen);
		return residue;
	}, [0, 0, 0] );

	Object.keys(argSignature).forEach(element => {
		let segGap = 3
		let singleArg = argSignature[element]
		singleArg.help = typeof singleArg.help == "string" ? [singleArg.help]: singleArg.help;
		process.stdout.write(  Paint("%__Br",fillup(element,segLengths[0],segGap) ));
		process.stdout.write(  fillup(singleArg.aliases.join(", "),segLengths[1],segGap) );

		let helpSkipCols = segLengths[0] + segGap + segLengths[1];
		if ( helpSkipCols + segGap + segLengths[2] > (process.stdout as any).columns ){
			helpSkipCols = segLengths[0];
			process.stdout.write( "\n" + fillup(" ", helpSkipCols, segGap));
		}
		process.stdout.write( singleArg.help[0] + "\n");
		for ( let i = 1; i < singleArg.help.length; ++i) {
			process.stdout.write( fillup(" ",helpSkipCols , segGap) + singleArg.help[i] + "\n");
		}
		process.stdout.write( "\n");
	});

	process.exit(0);
}

function fillup(text: string, cols: number, gap: number): string {

	let maxlen = Math.max(text.length, cols)
	if(!maxlen) {return "";}

	let stringBuilder = "";
	for (var i = 0; i < maxlen+gap; i++) {
		stringBuilder += text[i] || " ";
	}
	return stringBuilder;
}

printHelp();