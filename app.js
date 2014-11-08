
var fs = require('fs');
var _ = require('lodash');
var stripAnsi = require('strip-ansi');
var spawn = require('child_process').spawn;
var telegramProcess = spawn('./startbot.sh');

var Config = { };
var CommandProcessers = {};
telegramProcess.stdout.setEncoding('utf8');

// Give process 2secs to start before watching stdout
setTimeout(function() {

    console.log('starting bot');
    // Need to call dialog_list to get all chats and contacts
    telegramProcess.stdin.write('dialog_list\n');

    loadConfig(function(configdata) {
        Config = configdata;
        telegramProcess.stdout.on('data', function(data) {
            var lines = data.toString().split('\n');

            // telegram cli constantly outputs '>', don't bother trying to parse those
            if (lines.length > 1) {
                // telegram cli uses ansi color codes...need to strip them for parsing
                lines = _.map(lines, function(line) {
                    return stripAnsi(line);
                });

                // Message output should always be in the first line of data
                if (lines[0].indexOf('>>>') > -1) {
                    console.log(lines[0]);
                    var commandObj = buildCommandObj(lines[0]);
                    processCommand(commandObj);
                }
            }
        });
    });
}, 2000);

function parseCLIOutput(data) {
    var splitData = data.split(' >>> ');

    // Message is always the last element
    var message = splitData[splitData.length - 1];
    var metaData = splitData[0].split(' ');

    //User/Group to send to will always be the 3rd element.
    // User who sent the message is always last element of meta data.
    var sendTo = metaData[2];
    var user = metaData[metaData.length - 1];

    return {
        sendTo: sendTo,
        user: user,
        message: message
    };
}

function parseMessage(message) {
    var commandIdentifier = message.substring(0, 2);
    message = message.substring(2, message.length);

    // Only process messages that start with "#!" as commands
    if (commandIdentifier === '#!') {
        var command = message.match(/^[^\s]+/);

        // Should always be 1
        if (command.length > 0) {
            command = command[0];
        } else {
            return false;
        }

        var commandArgs = message.substring(command.length + 1, message.length);

        return {
            command: command,
            args: commandArgs
        };
    } else {
        return false;
    }
}

function processCommand(commandObj) {
    // Find command processor from config file
    var commandConfig = _.find(Config.commands, function(c) {
        return c.command === commandObj.command.command;
    });

    if (commandConfig) {
        // Check if the command was already proccessed previously.
        if (!CommandProcessers[commandConfig.command]) {
            CommandProcessers[commandConfig.command] = require('./commands/' + commandConfig.processor);
        }
        CommandProcessers[commandConfig.command].process(commandObj, telegramProcess);
    } else {
        console.log('Could not find command');
    }
}

function buildCommandObj(data) {
    var parsedOutput = parseCLIOutput(data);
    var parsedMessage = parseMessage(parsedOutput.message);

    return {
        sendTo: parsedOutput.sendTo,
        user: parsedOutput.user,
        command: parsedMessage
    };
}

function loadConfig(callback) {
    fs.readFile('config.js', 'utf8', function(err, data) {
        if (err)
            return console.log(err);

        callback(JSON.parse(data));
    });
}
