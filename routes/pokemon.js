var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require('fs')

var list = JSON.parse(fs.readFileSync('./list.json', 'utf8'));

router.get('/search', function(req, res){
    res.render('search');
})

router.get('/pokemon', function (req, res){
    var name = req.query.name;
    name = name.toLowerCase();
    var id = list[name];

    var baseUrl = "http://pokeapi.co"
    var pokemonUrl = "/api/v1/pokemon/" + id;
    var requestUrl = baseUrl + pokemonUrl;

    request(requestUrl, function(error, response, html) {
        if(error){
            return res.send(error);
        }
        if(!response || !response.body){
            return res.send("Please check that you spelled the name correctly.");
        }
        var parsedData = JSON.parse(response.body);
        var responseObject = {
            id: parsedData.national_id,
            name: parsedData.name,
            abilities: parsedData.abilities,
            type: parsedData.types
        };

        var descriptionUri = baseUrl + parsedData.descriptions[1].resource_uri;

        request(descriptionUri, function(error, response, html) {
            if(error){
                return res.send(error);
            }
            responseObject.description = JSON.parse(response.body).description;

            var nextId = id + 1;
            var nextPokemonUrl = "/api/v1/pokemon/" + nextId;
            var nextPokemonRequestUrl = baseUrl + nextPokemonUrl;

            request(nextPokemonRequestUrl, function(error, response, html) {
                if(error){
                    return res.send(error);
                }
                if (!response || !response.body){
                    console.log("There is no next pokemon");
                    responseObject.nextPokemon = null;
                }
                if(response && response.body){
                    responseObject.nextPokemon = JSON.parse(response.body).name;
                }

                var previousId = id - 1;
                var previousPokemonUrl = "/api/v1/pokemon/" + previousId;
                var previousPokemonRequestUrl = baseUrl + previousPokemonUrl;

                request(previousPokemonRequestUrl, function(error, response, html){
                    if(error){
                        return res.send(error)
                    }
                    if(!response || !response.body){
                        console.log("There is no previous pokemon");
                        responseObject.previousPokemon = null;
                    }
                    if(response && response.body){
                        responseObject.previousPokemon = JSON.parse(response.body).name;
                    }
                    return res.render("pokemon", responseObject);
                });
            });
        });
    });
});

module.exports = router;
