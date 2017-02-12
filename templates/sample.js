/*header*/
/*sys keywords:
$match, $null, ${varName}
 */
/* Globals
 result, stackPosition, {paramNames}, {imported Function names}
 */

//YAML example
	name: sample
	fill_between: /*@,@*/
	params:
		p1: Parameter 1
		p2: Parameter 2
		hook-path: Path to file where to hook
		insert-at: pattern of string to attach hook at

	remember: hook-path, insert-at
	required: hook-path, insert-at
	params_if:
		$match: p1,p2,stackPosition
		$null,_,0: 
			throw: param 1 can't be empty
		$null,_:
			print: Recursion failed
			return: $null
		_,test:
			when_done:
				run: sample2 ${p1} 1 
				run: sample2 ${p1} 2
			run: sample
	do:
		-	create: ${p1}.js
			write: ${result}
		-	in: ${hook-path}
			at: ${hook-pattern}
			write: require('${p1}')

			// OR
	import:
		-	script1.js
		-	script2.js
	call: init // specs later
		
/*header*/

;-P
/*@p1@*/
;-P