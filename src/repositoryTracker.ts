
import fs = require("fs");
import path = require("path");
import CLI from "./CLI";

export enum RecipeType{
	tetro, js,
}

export interface Itetro {
	name: string;
	path: string;
	type: RecipeType;
}

const _dir = path.resolve(process.cwd(), ".tetros");
const files = fs.readdirSync(_dir)
const recipes = {};
files.forEach( file => {
	let filepath = path.join(_dir , file);
	let fileStats = fs.lstatSync(filepath);
	let trimmedName: string;
	if(fileStats.isDirectory()){
		const subfiles = fs.readdirSync(filepath);
		let tmp: string = "";
		if (subfiles.indexOf(file + ".tetro") !== -1) {
			tmp = path.join(filepath , file + ".tetro");

		} else if(subfiles.indexOf("index.tetro") !== -1) {
			tmp = path.join(filepath , "index.tetro");

		} else if(subfiles.indexOf(file + ".js") !== -1) {
			tmp = path.join(filepath , file + ".js");

		} else if (subfiles.indexOf("index.js") !== -1) {
			tmp = path.join(filepath , "index.js");

		}
		if (!tmp) {return;}
		filepath = tmp;
		fileStats = fs.lstatSync(filepath);
		trimmedName = file;
	} else if ([".js", ".tetro"].indexOf(path.extname(filepath)) === -1) {
		return;
	} else {
		trimmedName = file.slice(0, -1 * path.extname(filepath).length);
	}

	if (recipes[trimmedName]) {
		const e = new ReferenceError(
			CLI.Paint("Multiple tetro files with same tetro name %rd_Br detected", trimmedName)
			);
		throw(e);
	}
	recipes[trimmedName] = {
		name: trimmedName,
		path: filepath,
		type: path.extname(filepath) === ".tetro" ? RecipeType.tetro : RecipeType.js,
	};
});

export default {
	getAllRecipes: () => {
		return recipes;
	},

	getRecipe: (key: string): Itetro => {
		return recipes[key];
	},

	printList: () => {
		Object.keys(recipes).forEach( item => {
			process.stdout.write(  recipes[item].name + "\n");
		})
		process.exit(0);
	},

	test: (recipeName: string) => {
		// Load a recipe and validate it.
		CLI.getInstance().throw("validation has not been implemented");
		return;
	}
}
