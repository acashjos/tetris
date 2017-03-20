/**
 * All the STD functions
 */

import CLI from "./CLI";
import RecipeParser from "./recipeParser";

const ENDL = "\n";

// These are keys in heap that cannot be set via setVal()
const unSettables = ["$attachments", "$endl"];

class STDOps {

	private heap: { [key: string]: any } = {
		$attachments: {},
		$commentLimitter: [],
		$destination: "",
		$endl: ENDL,
		$result: "",
	};
	private sequence: IstringMap[];

	constructor(private recipe: RecipeParser) {
	};


	public escape(expression: string): string {

		return expression.replace(/(\\|\$|\})/g, "\\$1");
	}

	public evalExp(expression: string): string {

		const { segments, evals } = this.resolveEvalComponents(expression);

		if (!evals || !evals.length) {
			return segments.join();
		}
		const results = evals.map(exp => {

			const [heapKey, ...args] = exp.replace(/\s+/g, " ").split(" ");
			if (typeof this.heap[heapKey] === "string") {
				if (!this.heap[heapKey]) {
					this.revert("Variable " + heapKey + " not defined ", expression);
				}
				return this.heap[heapKey];
			} else if (this.heap[heapKey] instanceof Function) {
				return this.heap[heapKey](...args) || "";
			}
		});
		return segments.reduce((residue, seg, index) => residue + seg + (results.splice(0, 1)[0] || ""), "");
	}

	public print(val: string) {
		CLI.Echo(val)
	}

	public resolveEvalComponents(exp: string): { segments: string[], evals: string[] } {
		// expression.match(/\$\{[^\}]+}/g)
		const resolvedSegments: string[] = [];
		const resolvedEvals: string[] = [];
		let resolveAsEvalExp = false;
		let segBuffer = "";
		let isEscaping = false;

		for (let i = 0; i < exp.length; ++i) {

			if (exp[i] === "\\" && !isEscaping) {
				isEscaping = true;
				continue;
			}
			if (exp[i] === "$" && !isEscaping) {
				if (resolveAsEvalExp) {
					let previous = resolvedSegments.splice(-1);
					resolvedSegments.push(previous[0] + segBuffer);
				} else {
					resolveAsEvalExp = true;
					resolvedSegments.push(segBuffer);
				}
				segBuffer = "";
			}
			segBuffer += exp[i];
			if (exp[i] === "}" && !isEscaping && resolveAsEvalExp) {
				let match = segBuffer.match(/^\$\{(.+)}$/)
				if (match && match[1]) {
					resolveAsEvalExp = false;
					resolvedEvals.push(match[1]);
				} else {
					let previous = resolvedSegments.splice(-1);
					resolvedSegments.push(previous[0] + segBuffer);
				}
				segBuffer = "";
			}

			isEscaping = false;
		}
		resolvedSegments.push(segBuffer)
		return { segments: resolvedSegments, evals: resolvedEvals };
	}

	public return(val: string) {
		print();
	}

	public revert(error: string, optional3rdLine?: string) {
		error += ENDL + "in recipe: " + this.recipe.getTetro().path;
		error += ENDL + optional3rdLine;
		// revert code
		CLI.Throw(error);
	}


	public selfCheck(): string | null {
		// This function assumes everything is normalized

		// $commentLimitter
		if (!Array.isArray(this.heap.$commentLimitter)) { return "$commentLimitter must be an array"; }
		if (this.heap.$commentLimitter.length !== 2) { return "$commentLimitter must have a starting and an ending segment"; }

		// $attachments
		const corruptAttachment = Object.keys(this.heap.$attachments).map(key => {
			const currentItem = this.heap.$attachments[key]
			if (!Array.isArray(currentItem.anchor)) { return `attachment anchor for ${key} must be an array`; }
			if (currentItem.anchor.length !== 2) {
				return `attachment anchor for ${key}  must have a starting and an ending segment`;
			}
			if (!currentItem.hook) {
				return `attachment hook for ${key} can't be empty.`;
			}
			if (!this.resolveEvalComponents(currentItem.hook).evals.length) {
				// throw(new Error( `attachment hook for ${key} can't be static. It must contain atleast one evalExp`));
				return `attachment hook for ${key} can't be static. It must contain atleast one evalExp`;
			}
			return false;
		}).filter(item => !!item);
		if (corruptAttachment.length) { return corruptAttachment.join('\n'); }

		// $params
		const $params = this.recipe.getConfig().$params || [];
		const corruptParams = $params.map(item => {
			const key = Object.keys(item)[0];
			const currentItem = item[key]
			if (currentItem.required && !this.heap[key]) { return `*required param '${key}' is not defined in heap`; }
			if (currentItem.validate && !RegExp(currentItem.validate).test(this.heap[key])) {
				return `param '${key}' does not pass validation /${currentItem.validate}/`;
			}
			return false;
		}).filter(item => !!item);
		if (corruptParams.length) { return corruptParams.join('\n'); }

		return null;
	}


/**
 * Sets a key value pair in the current context heap
 * @param key key
 * @param val value
 */
	public setVal(key: string, val: string) {
		if(unSettables.indexOf(key) !== -1) { return; }
		this.heap[key] = this.escape(val);
	}
}

export default STDOps;
