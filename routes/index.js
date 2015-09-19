var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var wordlist = require('english3kdata');
var lodash = require('lodash');
var async = require('async');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.post('/postword', function(req, res) {
    var word = req.body.key;
    console.log(word);
});

router.get('/pronunciation', function(req, res) {
    var wordsData = [];
    var keyword = req.params.keyword;
    async.forEachOf(wordlist.getAll(), function(word, key, callback) {
        var url = 'http://www.oxforddictionaries.com/definition/english/' + word.name;
        request(url, function(err, response, body) {
            var words = {};
            var count = 0;
            if (response.statusCode == 404) {
                count += count;
                console.log(count);
            } else if (!err && response.statusCode == 200) {
                var $ = cheerio.load(body);
                words.number = key;
                words.pronunciation = $('.headpron').text();
                words.sound = $('.sound').attr('data-src-mp3');
                words.name = word.name;
                var jsdata = [];
                $('div .senseGroup').each(function(index, item) {
                    var definition = $(item).find(".definition").text();
                    var title = $(item).find("h3").text();
                    var example = $(item).find(".example").text();
                    var moreInformation = $(item).find(".moreInformation").text();
                    jsdata.push({
                        'definition': definition,
                        'title': title,
                        'example': example,
                        'moreInformation': moreInformation
                    });
                });
            }
            words.data = jsdata;
            wordsData.push(words);
            console.log('length of word data' + wordsData.length);
            console.log('length of word list' + wordlist.getLength());
            if (wordsData.length === (wordlist.getLength() - count)) {
                callback(wordsData);
            }
        });
    }, function(results) {
        console.log('in');
        writeJSONFile(results);
        console.log('out');
    });
    return res.jsonp('words info');
});

var writeJSONFile = function(data) {
    var outoutFilename = 'infowordlist.json';
    fs.writeFile(outoutFilename, JSON.stringify(data, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('JSON svae to ' + outoutFilename);
        }
    });
};

module.exports = router;
