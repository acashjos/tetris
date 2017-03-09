// tslint:disable-next-line:no-var-requires
require("source-map-support").install();
import * as Promise from "bluebird";
import Main from "../app";

global.Promise = Promise;

// import {CustomError} from "./src/Errors"
const main = new Main(process.argv);
