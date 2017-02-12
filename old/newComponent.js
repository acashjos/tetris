var fs=require('fs')
var path=require('path')

console.log('_____________________________________')
// console.log(process.argv)

if(process.argv.length<4)
	throw("wrong syntax")

var flags= process.argv[2]
var dir
var name= process.argv[4]

if(!name){
	dir=process.cwd()
	name=process.argv[3]
}
else 
	dir=path.resolve(process.cwd(),process.argv[3])

// console.log(process.cwd(),process.argv[3],path.resolve(process.cwd(),process.argv[3]))
flags=flags.replace(/^-/,'')

var actionTemplate=`
import alt from '../../alt';

class `+name+`Actions {

  constructor() {
    this.generateActions(
      'getXXXXXXXXXDone',
      'getXXXXXXXXXFail'
    );
  }

    getXXXXXXXXX() {
       $.ajax({
          type: 'GET',
          url: "/api/userSession"
        })
          .done((data) => {
            this.actions.getXXXXXXXXXDone(data)
          })
          .fail((jqXhr) => {
            this.actions.getXXXXXXXXXFail()
          });
  }
}

export default alt.createActions(`+name+`Actions);

`

var storeTemplate=`
import alt from '../../alt';
import `+name+`Actions from './`+name+`Actions';

class `+name+`Store {
  constructor() {
    this.bindActions(`+name+`Actions);
    this.xxxxx
  }


  onGetXXXXXXXXXDone(session) {
    this.xxxxx=session
  }

  onGetXXXXXXXXXFail(){
  	this.xxxxx=null;
  }
}

export default alt.createStore(`+name+`Store);
`

var componentTemplate=`
import React from 'react';
import `+name+`Store from './`+name+`Store';
import `+name+`Actions from './`+name+`Actions';

class `+name+` extends React.Component {

	constructor(props) {
	  super(props);
	  this.state = `+name+`Store.getState();
	  this.onChange = this.onChange.bind(this);
	}

  onChange(state) {
    this.setState(state);
  }
	componentDidMount() {
		`+name+`Store.listen(this.onChange);
	    `+name+`Actions.getUserSession();
	}

  	render() {
	    return (
	      <div>

	      {this.state.sessionFetched&&this.props.children?
	      	React.cloneElement(this.props.children, {session:this.state.session})
	      	:false}
	      </div>
	    );
  	}
}

export default `+name+`;`


	if(dir==path.resolve(dir,'../')+'/'+name)
		console.log('included')
	else
		dir=dir+'/'+name
	try{
		console.log(fs.statSync(dir))	
	}
	catch(e){
		fs.mkdirSync(dir);
	}
	

// console.log(flags,dir,name)
// console.log('\n\n',path.resolve(dir,name+'Actions.js'))

if(flags=='fill'){

	fs.writeFileSync(path.resolve(dir,name+'Actions.js'),actionTemplate);
	fs.writeFileSync(path.resolve(dir,name+'Store.js'),storeTemplate);
}
else if(flags=='lean'){

	fs.writeFileSync(path.resolve(dir,name+'.js'),componentTemplate);
}
else if(flags=='all'){


	fs.writeFileSync(path.resolve(dir,name+'Actions.js'),actionTemplate);
	fs.writeFileSync(path.resolve(dir,name+'Store.js'),storeTemplate);
	fs.writeFileSync(path.resolve(dir,name+'.js'),componentTemplate);
}




