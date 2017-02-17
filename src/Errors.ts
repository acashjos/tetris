
let shouldTrace: Boolean = false

export default function debuggable(trace: Boolean){
    shouldTrace = trace
}

export  class CustomError extends Error{
    constructor(){
        // if(shouldTrace){
        //     console.trace("About to throw an error");
        // }
        super("Something went wrong");
    }
}

export  class DuplicateTemplatesError extends Error{
    constructor(){
        // if(shouldTrace){
        //     console.trace("About to throw an error");
        // }
        super("Multiple template files with same filename detected");
    }
}