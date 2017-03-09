
// import ArgvParser from "./src/ArgumentsParser";
import RecipeParser from "./src/recipeParser";

import CLI from "./src/Errors";
import Repository from "./src/repositoryTracker";

export interface IargumentDiscriptor {
	action: (argv?: string[]) => any;
	help: string| string[];
	aliases?: string[];
}

export default class Main {

	private argSignature: {[key: string]: IargumentDiscriptor} = {

		"--help": {
			action: this.printHelp.bind(this),
			aliases: ["-h"],
			help: "Prints this section",
		},

		"in": {
			action: this.pumpIn.bind(this),
			help: ["in {recipeName} [param1 [param2 [...]  ]", "Renders a recipe and injects."],
		},

		"list": {
			action: Repository.printList,
			help: "Prints list of all available recipes",
		},
		"out": {
			action: this.pumpOut.bind(this),
			help: ["out {recipeName}",
				"Reverts a tetro injection\n",
				"This will throw an error if the tetro doesn't have a revert strategy",
			],
		},
		"test": {
			action: () => { Repository.test(process.argv[3]); },
			help: ["{recipe-name}", "Validates the specified recipe"],
		},
	};

	public cli: CLI;

	constructor( argv: string[]) {

		this.cli = CLI.getInstance(this.argSignature);
		let command: string = process.argv[2];
		if (!command) {
			this.cli.throw();
			return;
		}
		let commandDefinition = this.argSignature[command];
		if (!commandDefinition) {

			command = Object.keys(this.argSignature).find(
				key => (this.argSignature[key].aliases || []).indexOf(command) > -1) || command;
			commandDefinition = this.argSignature[command];
		}

		if (!commandDefinition || !commandDefinition.action) {
			this.cli.throw();
		}

		// run the command
		commandDefinition.action(argv);

	}

	public async printHelp(args: string[]) {
		let helpTable = this.argSignature;
		if (args[3]) {
			const recipe = new RecipeParser(args.slice(3));
			helpTable = await recipe.getHelp();
			// console.log("***",helpTable)
			// return;
		}

		this.cli.printHelp(helpTable);

		process.exit(0);
	}

	private pumpOut(args: string[]) {
		const recipe = new RecipeParser(args.slice(3));
		recipe.undo();
	}

	private pumpIn(args: string[]) {
		const recipe = new RecipeParser(args.slice(3));
		recipe.do();
	}

}
