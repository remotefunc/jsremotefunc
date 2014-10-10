function remotejs(serverurl){
    var rmjs = this;
    //Helper function for doing a http request
    function http(method, url, data){
        var xmlHttp = new XMLHttpRequest();
        var fut = new future();
        xmlHttp.open(method, serverurl+url, true);
        xmlHttp.onreadystatechange = function(){
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                fut.callsuccess(JSON.parse(xmlHttp.responseText));
            }else if(xmlHttp.readyState == 4 && xmlHttp.status != 200){
                fut.callerror(xmlHttp.responseText);
            }
        }
        xmlHttp.send(JSON.stringify(data));
        return fut;
    }

    //Helper function for creating funcs
    function createfunc(name, options){
        return function(){
            var arr = [];
            for(var i = 0; i < arguments.length; i++){
                arr[i] = arguments[i];
            }
            var invocation = {
                "Function": name,
                "Parameters": arr
            }
            return http("POST", "/", invocation);
        }
    }

    //Get the functions from the specification
    http("GET", "/spec.json", null).success(function(data){
        for(var key in data){
            rmjs[key] = createfunc(key);
        } 
    }); 
}

//Small future implementation
function future(){
    //The data
    this.data = false;

    //Success or Error state
    this.issuccess = false;
    this.iserror = false;

    //Functions to get called
    this.successfun = false;
    this.errorfun = false;

    //Call when the future have succeeded
    this.callsuccess = function(data){
        this.issuccess = true;
        this.data = data;
        //If the success function have been set yet, call it
        if(this.successfun){
            this.successfun(data);
        }
    }

    //Call when the future have failed
    this.callerror = function(data){
        this.iserror = true;
        this.data = data;
        //If the error function have been set yet, call it
        if(this.errorfun){
            this.errorfun(data);
        }
    }

    //Assign the error callback function
    this.error = function(fun){
        this.errorfun = fun;
        //The error have already occurred
        if(this.iserror){
            this.errorfun(this.data);
        }
    }

    //Assign the success callback function
    this.success = function(fun){
        this.successfun = fun;
        //The success have already occurred
        if(this.issuccess){
            this.successfun(this.data);
        }
    }
}
