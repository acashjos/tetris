import fs = require("fs");
import Yaml = require("js-yaml");
import Inquirer = require("inquirer");
import {IargumentDiscriptor} from "../app";
import CLI from "./CLI";
import {default as Repository, Itetro, RecipeType } from "./repositoryTracker";
import STDOps from "./stdOps";

// import Promise = require("bluebird")

interface Icontent {yaml: string; template: string; split: boolean; }

const SPLIT_DELIMITTER = "::end";

export default class RecipeParser {

	private stdOps: STDOps;
	private config: any;
	private template: string;
	private params: {[key: string]: string} = {};
	private tetro: Itetro;
	private cli: CLI;

	constructor(private rawArgs: string[]) {
		this.stdOps = new STDOps(this);
		this.cli = CLI.getInstance();
	}

	public async load() {

		if (this.tetro ) {
			return;
		}

		this.tetro = Repository.getRecipe(this.rawArgs[0]);
		if (!this.tetro ) { this.cli.throw("Specified recipe does not exist"); }
		// var readFile = Promise.promisify(fs.readFile);
		// tslint:disable-next-line:no-console
		let content: string|Icontent = fs.readFileSync(this.tetro.path).toString();
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

		this.config = Yaml.safeLoad(content.yaml);
		this.template = content.template;

	}

	public undo() {
		return;
	}

	public async do() {
		await this.load();
		await this.loadParams(this.config.$params);
		return;
	}

	public async getHelp(): Promise<{[key: string]: IargumentDiscriptor}> {

		await this.load();

		return this.config.$params.reduce( (result, item) => {
			result["-" + Object.keys(item)[0]] = {help: item[Object.keys(item)[0]]};
			return result;
		} , {} );
	}

	private async loadParams(paramList: Array<{[key: string]: string}> ) {
		const unsorted: string[] = [];
		const paramNames = Object.keys(paramList);
		const paramsMap = paramList.reduce((r,item) => {
			const key = Object.keys(item)[0]
			r[key] =item[key];
			return r;
		} , {});

		for ( let i = 1; i < this.rawArgs.length; ++i) {
			const arg = this.rawArgs[i];
			if (arg[0] === "-") {
				const paramName = arg.substr(1);
				if (paramNames.indexOf(paramName) !== -1) {
					this.params[paramName] = this.rawArgs[++i];
				} else {
					CLI.getInstance().throw(CLI.Paint("option -%rd is not defined for %rd", paramName, this.tetro.name));
				}
			} else {
				unsorted.push(this.rawArgs[i]);
			}
		}

		let cursor = 0;
		paramNames.forEach( item => {
			if (this.params.hasOwnProperty(item)) {return; }
			this.params[item] = unsorted[cursor++];
		});

		// Load cached values here ..

		const missingParams = this.config.$required.filter( item => !this.params[item]);
		const result = await Inquirer.prompt(missingParams.map( item => ({"name": item, "message": paramsMap[item]})));
		CLI.Log(result);
	}
}
