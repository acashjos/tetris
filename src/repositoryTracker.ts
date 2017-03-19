
import fs = require("fs");
import path = require("path");
import CLI from "./CLI";
import Yaml = require("js-yaml");

export enum RecipeType {
	tetro, js,
}

export interface Itetro {
	name: string;
	path: string;
	type: RecipeType;
}

const INDEX_DIR = path.resolve(process.cwd(), ".tetris");
const NPM_SCOPE_DIR = path.resolve(process.cwd(), "node_modules", "@tetris");
const STORE_FILE = path.resolve(INDEX_DIR,"store.yaml");

const _dirs = [INDEX_DIR, NPM_SCOPE_DIR].filter(fs.existsSync);

if(!_dirs || !_dirs.length) { CLI.Throw("Not a tetris enabled project. exiting!! "); }
const files = _dirs.map(
	dir => fs.readdirSync(dir).map(
		file =>[dir, file]
		)
	).reduce((r,i) => r.concat(i),[])

const recipes: {[key: string]: Itetro} = {};

const store = fs.existsSync(STORE_FILE)
	? Yaml.safeLoad(fs.readFileSync(STORE_FILE, {encoding:"utf8", flag:"r+"}).toString())
	: {};


files.forEach( file => {
	let filepath =  path.join(file[0], file[1]);
	let fileStats = fs.lstatSync(filepath);
	let trimmedName: string;
	if(fileStats.isDirectory()){
		const subfiles = fs.readdirSync(filepath);
		let tmp: string = "";
		if (subfiles.indexOf(file[1] + ".tetro") !== -1) {
			tmp = path.join(filepath , file[1] + ".tetro");

		} else if(subfiles.indexOf("index.tetro") !== -1) {
			tmp = path.join(filepath , "index.tetro");

		} else if(subfiles.indexOf(file[1] + ".js") !== -1) {
			tmp = path.join(filepath , file[1] + ".js");

		} else if (subfiles.indexOf("index.js") !== -1) {
			tmp = path.join(filepath , "index.js");

		}

		if (!tmp) {return; }
		filepath = tmp;
		fileStats = fs.lstatSync(filepath);
		trimmedName = file[1];
	} else if ([".js", ".tetro"].indexOf(path.extname(filepath)) === -1) {
		return;
	} else {
		trimmedName = file[1].slice(0, -1 * path.extname(filepath).length);
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

	readStore(key: string): string {
		return store ? store[key] : "";
	},

	updateStoreCache(key: string, value: string) {
		store[key] = value;
	},
	writeStore(){
		fs.writeFileSync(STORE_FILE, Yaml.safeDump(store));
	},

	test: (recipeName: string) => {
		// Load a recipe and validate it.
		CLI.Throw("validation has not been implemented");
		return;
	}
}
