var request = require('request');
var fs = require('fs');

var baseUrl = "http://pokeapi.co/api/v1/pokemon/"
var i;
var list = {};

function makeList(startingIndex, callback){
    var requestUrl = baseUrl + startingIndex;

    request(requestUrl, function (error, response, html) {
        if(error){
            return callback(error);
        }
        if(!response || !response.body){
            return callback("You've reached the end");
        }
        var data = JSON.parse(response.body);
        var name = data.name;
        name = name.toLowerCase();
        list[name] = startingIndex;
        console.log(name + " " + startingIndex);
        return callback(null, ++startingIndex);
    });
}

//Starting index is one if you want to start from the beginning
// 718 should be the current latest
makeList(1, function callbackFunc(error, nextId) {
    if(error && error === "You've reached the end"){
        console.log(list);
        console.log(error);
        fs.writeFile('list.json', JSON.stringify(list), function(error){
            if(error){
                console.log(error);
                return
            }
            console.log('File successfully written! - Check your project directory for the output.json file');
            return
        });
        return
    }
    if(error) {
        return error;
    }
    return makeList(nextId, callbackFunc);
});
