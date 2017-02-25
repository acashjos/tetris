/**
 * All the STD functions
 */

import RecipeParser from "./recipeParser";

class STDOps{

	private store: Object = {};

	constructor(public tetro: RecipeParser){};

	public setVal(key, val) {
		this.store[key] = val;
	}

	public print(val){
		console.log(val);
	}

	public return(val){
		print();
	}

	public revert() {
		this.print(0);
	}

}

export default STDOps;
