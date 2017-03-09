
import chai = require("chai");
import RecipeParser from "../src/recipeParser";
var expect = chai.expect;

describe("pump in", () => {
	it("should be able to init app" , ()=>{
		//Arange
		let args = ["sample"]

		//Act
		let recipeParser = new RecipeParser(args);

		//Assert
		//expect(recipeParser.loadParams()).to.be.equal(25)
	})
})