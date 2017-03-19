interface IargumentDiscriptor {
	help: string| string[];
	aliases?: string[];
}
interface IargumentExecutableDiscriptor extends  IargumentDiscriptor{
	action: (argv?: string[]) => any;
}

interface IstringMap {[key: string]: string}
interface IparamDefinition { [paramName: string]: {
		cache: boolean; // cache to local store.
		hint: string;
		required: boolean;// prompt if not given
		validate?: string; // regexp to match before accepting
	} }

interface TetrisConfig {
	// defines the comment format relevant to the templated language. Default is `/*` and `*/`.
	// This could be an array(2) for a multi-line comment delimitters, or a string for single line delimitters
	// eg: $commentLimitter = "//" || ["/*", "*/"]
	$commentLimitter?: string | string[]

	// list of files in which reference to the generated file is to be injected and corresponding rules for attachment
	$attachments?: {
		// `path_to_file`(:string) in which reference is to be attached. This value can contain evalExp
		[path_to_file: string]: {
			// anchor defines an array of 2 string segments between which the reference is injected.
			// this is usually done enclosed as a comment. This value CANNOT contain evalExp
			// eg: anchor = ["/*imports*/", "/*endimports*/"]
			anchor: string[];
			// a `glue` is a string used to seperate each subsequent reference injections. This value CANNOT contain evalExp
			glue?: string;
			// the actual attachment string that is to be inserted. This value MUST contain evalExp
			// eg: hook = "require('${p1}');"
			hook: string;
			// matchIndent if true, tries for each new line to match indentation of anchor string. 
			matchIndent?: boolean;

			// the final injection will look like this
			// anchor[0] + hook(1) + glue +  hook(2) + glue + hook(3) + anchor[1]
			// in this example this would be something like:
			// /*imports*/require('hook1'); require('hook2'); require('hook3'); /*endimports*/
		}
	};
	//parameters to receive from CLI or the calling tetris function
	$params?: Array<{ [paramName: string]: string }|IparamDefinition>;

	$case?: {[conditions: string]: {[matchString: string]: IstringMap[]}};
	$do?: IstringMap[];

	//at the end of execution or when $release called (first occurance only) `${result}` is written to $destination
	//if this field is empty during $release, it'll throw an error and revert all changes.
	$destination?: string
}

// remove shorthand expressions.
interface NormalizedTetrisConfig extends TetrisConfig {

	$commentLimitter: string[]
	$params: Array<IparamDefinition>;

}