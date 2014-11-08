var echoCommand = {
    process: function(command, telegramProcess) {
        console.log('Processing echo command');
        console.log(command);
        console.log('msg ' + command.user + ' ' + command.command.args + '\n');

        telegramProcess.stdin.write('msg '  + command.sendTo + ' "' + command.command.args + '"\n');
    }
};

module.exports = echoCommand;