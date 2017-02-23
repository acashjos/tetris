import fs=require('fs')
import Yaml = require('js-yaml')
import ArgumentsParser from "./ArgumentsParser";
import STDOps from './stdOps'
import {/*default as Repository,*/Tetro,RecipeType} from  "./repositoryTracker"

// import Promise = require("bluebird")

interface Content {yaml: string, template: string, split:boolean}

const SPLIT_DELIMITTER = "::end"

export default class RecipeParser{

    stdOps: STDOps;
    
    constructor(){

        this.stdOps = new STDOps(this);
    }

    load(tetro: Tetro ){
        // var readFile = Promise.promisify(fs.readFile);
        console.log(tetro)
        var content: string|Content = fs.readFileSync(tetro.path).toString()
        content = content.split('\n').reduce((out,line) => {

            if(line == SPLIT_DELIMITTER) out.split = true;
            else if(out.split) out.template += line+"\n";
            else out.yaml += line+"\n";
            return out;

        } ,  {yaml: "", template: "", split:false})

        console.log("template", content.template)
    }
}