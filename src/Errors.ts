
let shouldTrace: Boolean = false;

export default function debuggable(trace: Boolean) {
	shouldTrace = trace;
}

export class GenericError extends Error {
	constructor() {
		// if(shouldTrace){
		//     console.trace("About to throw an error");
		// }
		super("Something went wrong");
	}
}



/** colors */
// Object.keys(colors).forEach(key => console.log(colors[key],key,"\x1b[0m"))
const resetColor = "\x1b[0m"; // reset
const colorMods = {
	Br: "\x1b[1m",  // Bright
	bl: "\x1b[5m",  // Blink
	dm: "\x1b[2m",  // Dim
	hd: "\x1b[8m",  // Hidden
	rv: "\x1b[7m",  // Reverse, inverse
	ul: "\x1b[4m",  // Underline
};
// Foreground
const fgColors = {
	bk: "\x1b[30m",
	bu: "\x1b[34m",
	cn: "\x1b[36m",
	gn: "\x1b[32m",
	mg: "\x1b[35m",
	rd: "\x1b[31m",
	wt: "\x1b[37m",
	yl: "\x1b[33m",
};

const bgColors = {
	bk: "\x1b[40m",
	bu: "\x1b[44m",
	cn: "\x1b[46m",
	gn: "\x1b[42m",
	mg: "\x1b[45m",
	rd: "\x1b[41m",
	wt: "\x1b[47m",
	yl: "\x1b[43m",
};

const mods = Object.keys(colorMods).join("|")+ "|_";
const fg = Object.keys(fgColors).join("|") + "|_";
const bg = Object.keys(bgColors).join("|") + "|_";
const globalRegx = new RegExp("%(" + fg + ")((" + bg + ")(" + mods +  ")?)?", "g");
const splitRegx = new RegExp("%(" + fg + ")((" + bg + ")(" + mods + ")?)?");


export function Paint(str: string, ...fillers: string[]): string {
	let seg = str.match(globalRegx);
	let out = "";
	let pointer = 0;
	for ( let x = 0; x < seg.length ; x++ ) {
		const position = str.indexOf(seg[x]);
		out += str.substr(pointer, position);
		pointer = position + seg[x].length;
		const components = seg[x].match(splitRegx);
		if (components[1] && components[1] !== "_") {out += fgColors[components[1]]; }
		if (components[3] && components[3] !== "_") {out += bgColors[components[3]]; }
		if (components[4] && components[4] !== "_") {out += colorMods[components[4]]; }
		out += fillers[x] + resetColor;
	}
	out += str.substr(pointer);
	return out;
}