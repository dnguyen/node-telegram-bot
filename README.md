#### Telegram Bot
- - -

##### Requirements
- - -
* Telegram messenger CLI ([https://github.com/vysheng/tg](https://github.com/vysheng/tg))

##### Running
- - -
Create or edit startbot.sh, make sure to include

    telegram-cli -k /path/to/api/key

Run the bot

    node app.js

#### Adding Commands
- - -
Edit config.js, and add a new command file to the commands folder. All commands should have the following structure:

    var command = {
        process: function(command, telegramProcess) {
            // handle command here
        };
    module.exports = command;
