
let shouldTrace: Boolean = false

export default function debuggable(trace: Boolean) {
    shouldTrace = trace
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
//Object.keys(colors).forEach(key => console.log(colors[key],key,"\x1b[0m"))
let resetColor = "\x1b[0m" //reset
let colorMods = {
    Br: "\x1b[1m",  //Bright
    dm: "\x1b[2m",  //Dim
    ul: "\x1b[4m",  //Underline
    bl: "\x1b[5m",   //Blink
    rv: "\x1b[7m",       //Reverse, inverse
    hd: "\x1b[8m",  //Hidden
}
//Foreground
let fgColors ={
    bk: "\x1b[30m",
    rd: "\x1b[31m",
    gn: "\x1b[32m",
    yl: "\x1b[33m",
    bu: "\x1b[34m",
    mg: "\x1b[35m",
    cn: "\x1b[36m",
    wt: "\x1b[37m",}

let bgColors = {
    bk: "\x1b[40m",
    rd: "\x1b[41m",
    gn: "\x1b[42m",
    yl: "\x1b[43m",
    bu: "\x1b[44m",
    mg: "\x1b[45m",
    cn: "\x1b[46m",
    wt: "\x1b[47m",
}

let mods = Object.keys(colorMods).join('|')+"|_"
let fg = Object.keys(fgColors).join('|')+"|_"
let bg = Object.keys(bgColors).join('|')+"|_"
let globalRegx = new RegExp("%("+fg+")(("+bg+")("+mods+")?)?","g")
let splitRegx = new RegExp("%("+fg+")(("+bg+")("+mods+")?)?")


export function Paint(string: string, ...fillers: string[]): string {
    let seg = string.match(globalRegx)
    let out = ""
    let pointer = 0
    for( let x in seg){
        let position = string.indexOf(seg[x])
        out += string.substr(pointer,position)
        pointer = position + seg[x].length
        let components = seg[x].match(splitRegx)
        if(components[1] && components[1]!='_') out += fgColors[components[1]]
        if(components[3] && components[3]!='_') out += bgColors[components[3]]
        if(components[4] && components[4]!='_') out += colorMods[components[4]]
        out += fillers[x] + resetColor;
    }
    out += string.substr(pointer)
    return out;
}