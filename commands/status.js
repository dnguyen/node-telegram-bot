var os = require('os'),
    exec = require('child_process').exec;

var statusCommand = {
    process: function(command, telegramProcess) {
        console.log('processing status command');
        console.log(command);
        exec('cat /etc/issue', function(error, distro, stderr) {
            if (!error) {
                var rtrStr = distro.split('\n').join('') + os.arch() + '\\n' +
                            'CPU Load: ' + (os.loadavg()[1] * 100).toFixed(2) + '%\\n' +
                            'Mem Usage: ' + ((os.freemem() / os.totalmem()) * 100).toFixed(2) + '%\\n' +
                            'Uptime: ' + (os.uptime() / 60 / 60).toFixed(2) + ' hours';

                telegramProcess.stdin.write('msg '  + command.sendTo + ' "' + rtrStr + '"\n');
            }
        });
    }
};

module.exports = statusCommand;