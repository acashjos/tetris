
// import ArgvParser from "./src/ArgumentsParser";
import RecipeParser from "./src/recipeParser";

import CLI from "./src/CLI";
import Repository from "./src/repositoryTracker";

// export 
export default class Main {

	private argSignature: {[key: string]: IargumentExecutableDiscriptor} = {

		"--help": {
			action: this.printHelp.bind(this),
			aliases: ["-h"],
			help: "Prints this section",
		},

		"eject": {
			action: this.eject.bind(this),
			help: ["eject {recipeName}",
				"Reverts a tetro injection\n",
				"This will throw an error if the tetro doesn't have a revert strategy",
			],
		},

		"inject": {
			action: this.inject.bind(this),
			help: ["inject {recipeName} [param1 [param2 [...]  ]", "Renders a recipe and injects."],
		},

		"list": {
			action: Repository.printList,
			help: "Prints list of all available recipes",
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
			CLI.Throw();
			return;
		}
		let commandDefinition = this.argSignature[command];
		if (!commandDefinition) {

			command = Object.keys(this.argSignature).find(
				key => (this.argSignature[key].aliases || []).indexOf(command) > -1) || command;
			commandDefinition = this.argSignature[command];
		}

		if (!commandDefinition || !commandDefinition.action) {
			CLI.Throw();
		}

		// run the command
		commandDefinition.action(argv);

	}

	public async printHelp(args: string[]) {
		let helpTable: {[key: string]: IargumentDiscriptor} = this.argSignature;
		if (args[3]) {
			const recipe = new RecipeParser(args.slice(3));
			helpTable = await recipe.getHelp();
			// console.log("***",helpTable)
			// return;
		}

		this.cli.printHelp(helpTable);

		process.exit(0);
	}

	private eject(args: string[]) {
		const recipe = new RecipeParser(args.slice(3));
		recipe.undo();
	}

	private inject(args: string[]) {
		const recipe = new RecipeParser(args.slice(3));
		recipe.do();
	}

}
