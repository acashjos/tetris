import fs=require('fs')
import Yaml = require('js-yaml')
import ArgumentsParser from "./ArgumentsParser";
import STDOps from './stdOps'


export default class RecipeParser{

    stdOps: STDOps;
    
    constructor(){

        this.stdOps = new STDOps(this);
    }

    load(recipe: Object){
        
        console.log(recipe)
    }
}