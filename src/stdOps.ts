/**
 * All the STD functions
 */

import RecipeParser from "./recipeParser";

class STDOps{

    store: Object = {}

    constructor(public tetro: RecipeParser){};

    setVal(key,val){
        this.store[key]=val;
    }

    print(val){ console.log(val);}

    return(val){
        print()
    }   

    revert(){

    }

}

export default STDOps