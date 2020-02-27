"use strict";

var _command = require("@oclif/command");

var _enquirer = require("enquirer");

var _chalk = _interopRequireDefault(require("chalk"));

var _chatAuth = require("../../../utils/auth/chat-auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ChannelDemoteModerator extends _command.Command {
  async run() {
    const {
      flags
    } = this.parse(ChannelDemoteModerator);

    try {
      if (!flags.channel || !flags.type || !flags.user) {
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
        }, {
          type: 'input',
          name: 'user',
          message: `What is the unique ID of the user to demote?`,
          required: false
        }]);

        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            flags[key] = res[key];
          }
        }
      }

      const client = await (0, _chatAuth.chatAuth)(this);
      const channel = await client.channel(flags.type, flags.channel);
      const exists = await client.queryUsers({
        id: {
          $in: [flags.user]
        }
      });

      if (!exists.users.length) {
        this.log(`The user ${flags.user} in channel ${_chalk.default.bold(flags.channel)} (${flags.type}) does not exist.`);
        this.exit();
      }

      const demote = await channel.demoteModerators([flags.user]);

      if (flags.json) {
        this.log(JSON.stringify(demote));
        this.exit();
      }

      this.log(`Channel ${_chalk.default.bold(flags.user)} has been demoted.`);
      this.exit();
    } catch (error) {
      await this.config.runHook('telemetry', {
        ctx: this,
        error
      });
    }
  }

}

ChannelDemoteModerator.flags = {
  channel: _command.flags.string({
    char: 'c',
    description: 'A unique ID for the channel you wish to create.',
    required: false
  }),
  type: _command.flags.string({
    char: 't',
    description: 'Type of channel.',
    required: false
  }),
  user: _command.flags.string({
    char: 'u',
    description: 'A unique ID for user to demote from a moderator.',
    required: false
  })
};
ChannelDemoteModerator.description = 'Demotes a moderator from a channel.';
module.exports.ChannelDemoteModerator = ChannelDemoteModerator;