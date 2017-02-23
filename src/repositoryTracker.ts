import fs=require('fs')
import path=require('path')
import {Paint} from "./Errors"

export enum RecipeType{
    tetro,
    js
}

export interface Tetro {
    name: string,
    path: string,
    type: RecipeType
}

export default class Repository{
    _dir: string;
    recipes: any;


    constructor(){
        this._dir = path.resolve(process.cwd(),".tetros")
        let files = fs.readdirSync(this._dir)
        this.recipes = {}
        files.forEach(file => {
            let filepath = path.join(this._dir , file)
            let fileStats = fs.lstatSync(filepath)
            let trimmedName: string
            if(fileStats.isDirectory()){
                let subfiles = fs.readdirSync(filepath) 
                let tmp: string;
                if(subfiles.indexOf(file+'.tetro') != -1) tmp = path.join(filepath , file+'.tetro')
                else if(subfiles.indexOf('index.tetro') != -1) tmp = path.join(filepath , 'index.tetro')
                else if(subfiles.indexOf(file+'.js') != -1) tmp = path.join(filepath , file+'.js')
                else if(subfiles.indexOf('index.js') != -1) tmp = path.join(filepath , 'index.js')
                if(!tmp) return;
                filepath = tmp
                fileStats = fs.lstatSync(filepath)
                trimmedName = file
            }
            else if([".js",".tetro"].indexOf(path.extname(filepath)) == -1) return;
            else trimmedName = file.slice(0, -1 * path.extname(filepath).length)
            if(this.recipes[trimmedName]) {
                let e = new ReferenceError(Paint("Multiple tetro files with same tetro name %rd_Br detected",trimmedName))
                throw(e);
            }
            this.recipes[trimmedName] = {
                name: trimmedName,
                path: filepath,
                type: path.extname(filepath) == ".tetro" ? RecipeType.tetro : RecipeType.js
            }
        })

    }

    getAllRecipes(): Object{
        return this.recipes
    }

    getRecipe(key: string){
        return this.recipes[key]
    }
}