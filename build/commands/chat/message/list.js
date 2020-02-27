"use strict";

var _command = require("@oclif/command");

var _enquirer = require("enquirer");

var _moment = _interopRequireDefault(require("moment"));

var _chalk = _interopRequireDefault(require("chalk"));

var _chatAuth = require("../../../utils/auth/chat-auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MessageList extends _command.Command {
  async run() {
    const {
      flags
    } = this.parse(MessageList);

    try {
      if (!flags.channel || !flags.type || !flags.json) {
        const res = await (0, _enquirer.prompt)([{
          type: 'input',
          name: 'channel',
          message: `What is the unique identifier for the channel?`,
          required: true
        }, {
          type: 'select',
          name: 'type',
          message: 'What type of channel is this?',
          required: true,
          choices: [{
            message: 'Livestream',
            value: 'livestream'
          }, {
            message: 'Messaging',
            value: 'messaging'
          }, {
            message: 'Gaming',
            value: 'gaming'
          }, {
            message: 'Commerce',
            value: 'commerce'
          }, {
            message: 'Team',
            value: 'team'
          }]
        }]);

        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            flags[key] = res[key];
          }
        }
      }

      const client = await (0, _chatAuth.chatAuth)(this);
      client.channel(flags.type, flags.channel);
      const messages = await client.queryChannels({
        cid: `${flags.type}:${flags.channel}`
      }, {
        last_message_at: -1
      }, {
        watch: false,
        presence: false
      });

      if (flags.json) {
        if (!messages.length) {
          this.log(JSON.stringify({
            error: 'No messages available.'
          }));
          this.exit();
        }

        this.log(JSON.stringify(messages[0].state.messages));
        this.exit();
      }

      if (!messages.length) {
        this.log('No messages available.');
        this.exit();
      }

      const data = messages[0].state.messages;

      if (data.length === 0) {
        this.log('No messages available.');
        this.exit();
      }

      for (let i = 0; i < data.length; i++) {
        const timestamp = `${data[i].deleted_at ? 'Deleted on' : 'Created at'} ${(0, _moment.default)(data[i].created_at).format('dddd, MMMM Do YYYY [at] h:mm:ss A')}`;
        this.log(`Message ${_chalk.default.bold(data[i].id)} (${timestamp}): ${data[i].text}`);
      }

      this.exit();
    } catch (error) {
      await this.config.runHook('telemetry', {
        ctx: this,
        error
      });
    }
  }

}

MessageList.flags = {
  type: _command.flags.string({
    char: 't',
    description: 'The type of channel.',
    required: false
  }),
  channel: _command.flags.string({
    char: 'c',
    description: 'The ID of the channel that you would like to send a message to.',
    required: false
  }),
  json: _command.flags.boolean({
    char: 'j',
    description: 'Output results in JSON. When not specified, returns output in a human friendly format.',
    required: false
  })
};
MessageList.description = 'Lists all messages.';
module.exports.MessageList = MessageList;