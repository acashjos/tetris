
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
		recipeParser.do();
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

	function applyOnPerfectHeap(keys,val){
		stdops.heap = {
			$attachments: {
				"path1.js":{
					anchor: ["/*","*/"],
					glue: "string",
					hook: "string${eval}",
					matchIndent: false
				},
				"another/path.js":{
					anchor: ["#","\n"],
					hook: "string${eval}",
					matchIndent: true
				}
			},
			$commentLimitter: ["/*", "*/"],

		}
		if(keys && keys.length){
			keys.reduce( (r,key,pos) => {
				if(pos == keys.length-1) r[key] = val;
				return r ? r[key] : r;
			},stdops.heap)
		}
	}

	after( ()=>{

		stdops.heap = {
			$attachments: {},
			$destination: "",
			$result: "",
			$commentLimitter: [],
		};
	})

	it("should check if the STDOps configuration is correct and normalized.", ()=>{

		applyOnPerfectHeap();
		expect(stdops.selfCheck(),"perfectHeap should pass selfTest").to.be.a('null');
		//comment limiter
		applyOnPerfectHeap(["$commentLimitter"] ,"//");
		// expect(stdops.selfCheck(),"$commentLimitter can't be string").not.to.be.a('null');

		applyOnPerfectHeap(["$commentLimitter"] ,["//"]);
		expect(stdops.selfCheck(),"$commentLimitter should be a `string[2]`").not.to.be.a('null');


		// $attachments
		applyOnPerfectHeap(["$attachments", "path1.js","anchor"] ,undefined);
		expect(stdops.selfCheck(),"$attachments anchor can't be empty").not.to.be.a('null');

		applyOnPerfectHeap(["$attachments", "path1.js","anchor"] ,"//");
		expect(stdops.selfCheck(),"$attachments anchor should be an array").not.to.be.a('null');

		applyOnPerfectHeap(["$attachments", "path1.js","anchor"] ,["//"]);
		expect(stdops.selfCheck(),"$attachments anchor should contain exactly 2 elements").not.to.be.a('null');

		applyOnPerfectHeap(["$attachments", "path1.js","anchor"] ,["//","tt","\\"]);
		expect(stdops.selfCheck(),"$attachments anchor should contain exactly 2 elements").not.to.be.a('null');

		applyOnPerfectHeap(["$attachments", "path1.js","hook"] ,undefined);
		expect(stdops.selfCheck(),"$attachments hook can't be empty").not.to.be.a('null');

		applyOnPerfectHeap(["$attachments", "path1.js","hook"] ,"statc string");
		expect(stdops.selfCheck(),"$attachments hook can't be empty").not.to.be.a('null');

		/* $params */
	})
})