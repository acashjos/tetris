
const chai = require("chai");
// const rewire = require("rewire");
const RecipeParser = require("../build/ts/src/recipeParser").default;
const STDOps = require("../build/ts/src/stdOps").default;
var expect = chai.expect;
var assert = chai.assert;


//Arange
		let args = ["sample","1","2"]

		//Act
		let recipeParser = new RecipeParser(args);
		let stdops = new STDOps(recipeParser)

describe("evalExp()", () => {
	it("should be able to evaluate 'string..${hook-path}..string' to  'string..554..string'", ()=>{
		
		let heap = stdops.heap;
		let resolveExpression = stdops.resolveExpression
		stdops.resolveExpression= ()=> ({"segments":["string..","..string"], "evals":["hook-path"]})
		stdops.heap = {"hook-path":"554"}
		//Assert
		// expect(stdops.evalExp("string..${hook-path}..string")).to.be.equal("string..554..string")
		assert.equal(stdops.evalExp("string..${hook-path}..string"),"string..554..string","evaluation is wrong")
		stdops.heap = heap;
		stdops.resolveExpression = resolveExpression;
	})

})

describe("escape()", () => {
	it("should escape characters '$','}' and '\\' with a '\\'", ()=>{

		expect(stdops.escape("string.\\.${hook-path}..string")).to.equal("string.\\\\.\\${hook-path\\}..string");
		expect(stdops.escape("string.\\.\\${hook-path\\}..string"), "should escape '\\{' as `\\\\\\{`")
		.to.equal("string.\\\\.\\\\\\${hook-path\\\\\\}..string");
		expect(stdops.escape("string.\\.\\${hook-path\\}..string"), "should not escape '{'")
		.to.not.equal("string.\\\\.\\\\\\$\\{hook-path\\\\\\}..string");
	})
})

describe("resolveExpression()", () => {
	it("should parse and break an evalexp into segments and evals", ()=>{

		assert.deepEqual(
			stdops.resolveEvalComponents("string..${hook-path}..string"),
			{segments:["string..","..string"], evals:["hook-path"]},
			"eval blocks should be replaced with evaluated blocks"
		)

		assert.notDeepEqual(
			stdops.resolveEvalComponents("string..$hook-path}..string"),
			{segments:["string..","..string"], evals:["hook-path"]},
			"eval blocks should match ${ val } pattern: $ val} given in"
		)
		assert.deepEqual(
			stdops.resolveEvalComponents("string..${hook-${p1}ath}..string"),
			{segments:["string..${hook-","ath}..string"], evals:["p1"]},
			"nested evals should only consider the deepest block."
		)
		assert.deepEqual(
			stdops.resolveEvalComponents("string..${hook-\\${p1\\}ath}..string"),
			{segments:["string..","..string"], evals:["hook-${p1}ath"]},
			"escaped charactes within block should not cause panic."
		)
	})
})


describe("selfCheck()", () => {

	after( ()=>{

		stdops.heap = {
			$attachments: {},
			$destination: "",
			$result: "",
			$commentLimitter: [],
		};
	})

	it("should check if the STDOps configuration is correct and normalized.", ()=>{
		//comment limiter
		stdops.heap.$commentLimitter = "//";
		expect(stdops.selfCheck(),"$commentLimitter can't be string")
		.to.equal("$commentLimitter must be an array");

		stdops.heap.$commentLimitter = ["//"];
		expect(stdops.selfCheck(),"$commentLimitter should be a `string[2]`")
		.to.equal("$commentLimitter must have a starting and an ending segment");

		// stdops.heap.$commentLimitter = ["//","\n"];
		// expect(stdops.selfCheck(),"$commentLimitter is a `string[2]` but still failed")
		// .to.equal("$commentLimitter must have a starting and an ending segment");

		// $attachments
		stdops.heap.$attachments = {
			"path1.js":{
				anchor: "//",
				glue?: string,
				hook: string,
				matchIndent: boolean;
			}
		};
		expect(stdops.selfCheck(),"$commentLimitter can't be string")
		.to.equal("$commentLimitter must be an array");

		stdops.heap.$commentLimitter = ["//"];
		expect(stdops.selfCheck(),"$commentLimitter should be a `string[2]`")
		.to.equal("$commentLimitter must have a starting and an ending segment");
	})
})