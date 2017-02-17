import fs=require('fs')
import path=require('path')
import {DuplicateTemplatesError} from "../src/Errors"

enum Type{
    tetro,
    js
}


export default class Repository{
    _dir: string;
    templates: Object;


    constructor(){
        this._dir = path.resolve(process.cwd(),"templates")
        let files = fs.readdirSync(this._dir)
        this.templates = {}
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
            if(this.templates[trimmedName]) 
                throw(new DuplicateTemplatesError())
            this.templates[trimmedName] = {
                name: trimmedName,
                path: filepath,
                type: path.extname(filepath) == ".tetro" ? Type.tetro : Type.js
            }
        })

        console.log(this.templates)
    }

    getTemplates(): Object{
        return this.templates
    }
}