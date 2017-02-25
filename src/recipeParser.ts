import fs = require("fs");
import Yaml = require("js-yaml");
import ArgumentsParser from "./ArgumentsParser";
import {/*default as Repository,*/ Itetro, RecipeType } from "./repositoryTracker"
import STDOps from "./stdOps";

// import Promise = require("bluebird")

interface Icontent {yaml: string; template: string; split: boolean; }

const SPLIT_DELIMITTER = "::end";

export default class RecipeParser{

	private stdOps: STDOps;

	constructor() {

		this.stdOps = new STDOps(this);
	}

	public load(tetro: Itetro ){
		// var readFile = Promise.promisify(fs.readFile);
		// tslint:disable-next-line:no-console
		console.log(tetro)
		let content: string|Icontent = fs.readFileSync(tetro.path).toString()
		content = content.split("\n").reduce((out, line) => {

			if (line === SPLIT_DELIMITTER) {
				out.split = true;
			} else if (out.split) {
				out.template += line + "\n";
			} else {
				out.yaml += line + "\n";
			}
			return out;

		} ,  {yaml: "", template: "", split: false});

		// tslint:disable-next-line:no-console
		console.log("template", content.template);
	}
}