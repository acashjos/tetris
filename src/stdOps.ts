/**
 * All the STD functions
 */

import CLI from "./CLI";
import RecipeParser from "./recipeParser";

class STDOps {

	private store: Object = {};

	constructor(public tetro: RecipeParser) {};

	public setVal(key, val) {
		this.store[key] = val;
	}

	public print(val) {
		CLI.Log(val);
	}

	public return(val) {
		print();
	}

	public revert() {
		this.print(0);
	}

}

export default STDOps;
