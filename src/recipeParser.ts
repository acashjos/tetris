import fs = require("fs");
import Yaml = require("js-yaml");
import Inquirer = require("inquirer");
import CLI from "./CLI";
import { default as Repository, Itetro, RecipeType} from "./repositoryTracker";
import STDOps from "./stdOps";

// import Promise = require("bluebird")

interface Icontent {yaml: string; template: string; split: boolean; }

const SPLIT_DELIMITTER = "::end";
/**
 * Returns the value part of single element object (key:val pair)
 *  NB: this is a convineance function to avoid using `obj[Object.keys(obj)[0]]`
 *  It breaks typechecking. Remember to cast the results to relavent types
 * @param obj Single element object
 */
function _(obj: any){
	if(obj){
		const key = Object.keys(obj)[0]
		return obj[key]
	}
	return obj;
}

export default class RecipeParser {

	private stdOps: STDOps;
	private config: NormalizedTetrisConfig;
	private template: string;
	private params: IstringMap = {};
	private tetro: Itetro;
	// private cli: CLI;

	constructor(private rawArgs: string[]) {
		this.stdOps = new STDOps(this);
		// this.cli = CLI.getInstance();
	}

	public async load() {

		if (this.tetro ) {
			return;
		}

		this.tetro = Repository.getRecipe(this.rawArgs[0]);
		if (!this.tetro ) { CLI.Throw("Specified recipe does not exist"); }
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

		const config = Yaml.safeLoad(content.yaml);
		this.template = content.template;
		this.config = this.normalizeConfig(config);
		const validityError = this.validate(this.config);
		if(validityError){
			CLI.Throw("This recipe failed correctness check\n" + validityError);
		}
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
		const params = this.config.$params;
		return this.config.$params.reduce( (result: {[key: string]: IargumentDiscriptor}, item: IparamDefinition) => {
			result["-" + Object.keys(item)[0]] = {help: _(item).hint};
			return result;
		} , {} );
	}


	public getTetro(): Itetro {
		return this.tetro;
	}

	public getParams(): IstringMap {
		return this.params;
	}
	public getConfig(): NormalizedTetrisConfig {
		return this.config;
	}

/**
 * Organizes arguments into variables declared in paramList
 * @param paramList List of all parameters
 */
	private async loadParams(paramList: IparamDefinition[] | undefined) {

		if(!paramList) { return; }

		const unsorted: string[] = [];
		const paramNames = paramList.map( param => Object.keys(param)[0] );

		// Identifying params with cache enabled
		const cacheList: string[] = paramList
		.filter( item => !!_(item).cache)
		.map( item => Object.keys(item)[0]);

		// Read cached values from store.yaml
		cacheList.reduce( (r: IstringMap, item: string) => {
			r[item] = Repository.readStore(this.tetro.name + "." + item);
			return r;
		}, this.params);

		const paramsMap = paramList.reduce((r, item) => {
			const key = Object.keys(item)[0]
			r[key] = item[key];
			return r;
		} , {});

		for ( let i = 1; i < this.rawArgs.length; ++i) {
			const arg = this.rawArgs[i];
			if (arg[0] === "-") {

				const paramName = arg.substr(1);

				if (paramNames.indexOf(paramName) !== -1) {
					this.params[paramName] = this.rawArgs[++i];
				} else {
					CLI.Throw(CLI.Paint("option -%rd is not defined for %rd", paramName, this.tetro.name));
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


		const missingParams = paramList
			.filter( item => !!_(item).required && !this.params[Object.keys(item)[0]])
			.map( item => Object.keys(item)[0]) as string[];//this.config.$required.filter((item: string) => !this.params[item]);
		const result = await Inquirer.prompt(
			missingParams.map( (item: string) => ({ name: item, message: paramsMap[item].hint}) )
		);
		Object.assign(this.params, result);
		CLI.Log(this.params);

		// Dump cache updates to store.yaml
		cacheList.forEach( (item: string) => {
			if (this.params[item] === Repository.readStore(this.tetro.name + "." + item)) { return; }
			Repository.updateStoreCache(this.tetro.name + "." + item, this.params[item]);
		});
		Repository.writeStore();
	}


	private normalizeConfig(tetrisConfig: TetrisConfig): NormalizedTetrisConfig {
		// expanding params
		// @dirty
		const normalized = JSON.parse(JSON.stringify(tetrisConfig)) as NormalizedTetrisConfig;

		normalized.$commentLimitter = tetrisConfig.$commentLimitter ?
			( typeof tetrisConfig.$commentLimitter == "string") ?
				[tetrisConfig.$commentLimitter]
				: tetrisConfig.$commentLimitter
			: ["/*", "*/"];
		if(!normalized.$commentLimitter[1] ) { normalized.$commentLimitter[1] = "\n"; }
		if (normalized.$params) {
			normalized.$params = normalized.$params.map(row => {
				const key = Object.keys(row)[0];
				const param = row[key];
				const defaultRet = {
					cache: false,
					hint: "",
					required: false,
				}
				const ret = (typeof param === "string") ? { hint: param } : param;
				row[key] = Object.assign(defaultRet, ret);
				return row;
			});
		}

		return normalized;
	}

	private validate(tetrisConfig: NormalizedTetrisConfig): string | undefined{
		//tetrisConfig
		return ;
	}
}
