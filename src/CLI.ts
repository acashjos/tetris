import * as path from "path";
import * as stackTrace from "stack-trace";
import * as util from "util";

/** colors */
// Object.keys(colors).forEach(key => CLI.Log(colors[key],key,"\x1b[0m"))

const ENDL = "\n";
const resetColor = "\x1b[0m"; // reset
const colorMods: IstringMap = {
	Br: "\x1b[1m",  // Bright
	bl: "\x1b[5m",  // Blink
	dm: "\x1b[2m",  // Dim
	hd: "\x1b[8m",  // Hidden
	rv: "\x1b[7m",  // Reverse, inverse
	ul: "\x1b[4m",  // Underline
};
// Foreground
const fgColors: IstringMap = {
	bk: "\x1b[30m",
	bu: "\x1b[34m",
	cn: "\x1b[36m",
	gn: "\x1b[32m",
	mg: "\x1b[35m",
	rd: "\x1b[31m",
	wt: "\x1b[37m",
	yl: "\x1b[33m",
};

const bgColors: IstringMap = {
	bk: "\x1b[40m",
	bu: "\x1b[44m",
	cn: "\x1b[46m",
	gn: "\x1b[42m",
	mg: "\x1b[45m",
	rd: "\x1b[41m",
	wt: "\x1b[47m",
	yl: "\x1b[43m",
};

const mods = Object.keys(colorMods).join("|") + "|_";
const fg = Object.keys(fgColors).join("|") + "|_";
const bg = Object.keys(bgColors).join("|") + "|_";
const globalRegx = new RegExp("%(" + fg + ")((" + bg + ")(" + mods + ")?)?", "g");
const splitRegx = new RegExp("%(" + fg + ")((" + bg + ")(" + mods + ")?)?");

export default class CLI {

	private static instance: CLI;

	public static getInstance(argSignature?: { [key: string]: IargumentDiscriptor }, debug?: boolean): CLI {

		CLI.instance = CLI.instance || new CLI(argSignature, debug );
		return CLI.instance;
	}

	public static Paint(str: string, ...fillers: string[]): string {

		const seg = str.match(globalRegx);
		let out = "";
		let pointer = 0;
		if (!seg) { return str; }
		for (let x = 0; x < seg.length; x++) {
			const position = str.indexOf(seg[x]);
			out += str.substr(0, position);
			pointer = position + seg[x].length;
			str = str.substr(pointer);
			const components = seg[x].match(splitRegx);
			if (!components) {
				out += seg[x];
				continue;
			}
			if (components[1] && components[1] !== "_") { out += fgColors[components[1]]; }
			if (components[3] && components[3] !== "_") { out += bgColors[components[3]]; }
			if (components[4] && components[4] !== "_") { out += colorMods[components[4]]; }
			out += fillers[x] + resetColor;
		}
		out += str.substr(pointer);
		return out;
	}

	public static Log(...args: any[]) {
/*
* Make CLI.Log verbose with filename and line number indication
*/
		if (process.env.NODE_ENV === "development") {
			const err = new Error("Artificial error");
			const traceList = stackTrace.parse(err);
			const trace = traceList[1];
			process.stdout.write(
					CLI.Paint( "%wt_Br ", "@ - line: "
					+ trace.getLineNumber()
					+ " on  "
					+ path.relative(__dirname, trace.getFileName()))
				+ ENDL );
			for (let x = 0; x < arguments.length; ++x) {

				if (arguments[x] ===  null || arguments[x] ===  undefined) {
					process.stdout.write(util.inspect(arguments[x], {colors: true}));
				}else {
					process.stdout.write(
						CLI.Paint("%__Br", arguments[x].constructor.name
							+ (arguments[x].length ? `(${arguments[x].length})` : "")
							+ ": ")
						+ util.inspect(arguments[x], {colors: true}));
				}

				process.stdout.write( ENDL);
			}

			process.stdout.write(
				Array.from(Array( Math.floor((process.stdout as any).columns / 2)).keys()).reduce( (r, x) => r + "-", "") + ENDL);
		}
		// else do not log
	}

	public static Echo(output: string){
		process.stdout.write(ENDL + output);
	}

	public static Throw(msg?: string) {
		const out = msg || "unknown operation!! please try any of the following";
		process.stdout.write(out+ENDL);
		if (process.env.NODE_ENV === "development") {
			// tslint:disable-next-line:no-console
			console.trace(CLI.Paint("%rd_Br", out));
		}
		if (!msg && CLI.instance) { CLI.instance.printHelp(); }
		process.exit(0);
	}

	private constructor(private argSignature?: { [key: string]: IargumentDiscriptor }, private debug?: boolean) {
		if (!argSignature) {
			this.argSignature = {};
			CLI.Throw("CLI not initialized");
		}
	}

	public printHelp(printSignature?: { [key: string]: IargumentDiscriptor }) {

		const signature = printSignature || this.argSignature;
		if (!signature) { return; }
		const segLengths: number[] = Object.keys(signature).reduce((residue, item) => {

			residue[0] = Math.max(residue[0], item.length);
			const singleArg = signature[item];
			singleArg.aliases = singleArg.aliases || [];
			residue[1] = Math.max(residue[0], singleArg.aliases.join(", ").length);

			const curlen = typeof signature[item].help === "string" ?
				signature[item].help.length : signature[item].help[0].length;
			residue[2] = Math.max(residue[2], curlen);

			return residue;
		}, [0, 0, 0]);

		Object.keys(signature).forEach(element => {

			process.stdout.write(ENDL + ENDL);

			const segGap = 3;
			const singleArg = signature[element];
			singleArg.aliases = singleArg.aliases || [];
			singleArg.help = typeof singleArg.help === "string" ? [singleArg.help] : singleArg.help;
			process.stdout.write(CLI.Paint("%__Br", this.fillup(element, segLengths[0], segGap)));
			process.stdout.write(this.fillup(singleArg.aliases.join(", "), segLengths[1], segGap));

			let helpSkipCols = segGap + segLengths[0] + segGap + segLengths[1];

			if (helpSkipCols + segGap + segLengths[2] > (process.stdout as any).columns) {
				helpSkipCols = segGap + segLengths[0];
				process.stdout.write(ENDL + this.fillup(" ", helpSkipCols, segGap));
			}

			process.stdout.write(singleArg.help[0] + ENDL);

			for (let i = 1; i < singleArg.help.length; ++i) {
				process.stdout.write(this.fillup(" ", helpSkipCols, segGap) + singleArg.help[i] + ENDL);
			}

			process.stdout.write(ENDL);
		});
	}

	private fillup(text: string, cols: number, gap: number): string {

		const maxlen = Math.max(text.length, cols);
		if (!maxlen) {return ""; }

		let stringBuilder = Array.from(Array(gap).keys()).reduce( str => ( str + " "), "");
		for (let i = 0; i < maxlen + gap; i++) {
			stringBuilder += text[i] || " ";
		}
		return stringBuilder;
	}
}
