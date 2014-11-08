var request = require('request'),
    cheerio = require('cheerio');

var wikiCommand = {
    process: function(command, telegramProcess) {
        console.log('Processing wiki command');
        console.log(command);
        var searchURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + command.command.args + '&format=json';

        // Search wikipedia to get proper article name
        request(searchURL, function(error, response, results) {
            if (!error) {
                results = JSON.parse(results);
                var articleName = results[1][0];
                if (articleName) {
                    // Get article's page id from title
                    var articleURL = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + escape(articleName) + '&continue='

                    request(articleURL, function(error, response, articleResult) {
                        var articleData = JSON.parse(articleResult);

                        // Get html for article
                        var articleHtmlReqUrl = 'http://en.wikipedia.org/wiki?curid=' + articleData.query.pages[Object.keys(articleData.query.pages)].pageid;
                        request(articleHtmlReqUrl, function(error, response, articleHtml) {
                            if (error)
                                console.log(error);

                            $ = cheerio.load(articleHtml);
                            var firstParagraph = $('p').first().text();
                            telegramProcess.stdin.write("msg " + command.sendTo + " " + firstParagraph + "\n");
                        });
                    });
                }
            }
        });
    }
};

module.exports = wikiCommand;