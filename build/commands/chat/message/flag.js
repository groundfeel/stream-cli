"use strict";

var _command = require("@oclif/command");

var _enquirer = require("enquirer");

var _chalk = _interopRequireDefault(require("chalk"));

var _chatAuth = require("../../../utils/auth/chat-auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MessageFlag extends _command.Command {
  async run() {
    const {
      flags
    } = this.parse(MessageFlag);

    try {
      if (!flags.message) {
        const res = await (0, _enquirer.prompt)([{
          type: 'input',
          name: 'message',
          message: 'What is the unique identifier for the message?',
          required: true
        }]);
        flags.message = res.message;
      }

      const client = await (0, _chatAuth.chatAuth)(this);
      const response = client.flagMessage(flags.message);

      if (flags.json) {
        this.log(JSON.stringify(response));
        this.exit();
      }

      this.log(`Message ${_chalk.default.bold(flags.message)} has been flagged.`);
      this.exit();
    } catch (error) {
      await this.config.runHook('telemetry', {
        ctx: this,
        error
      });
    }
  }

}

MessageFlag.flags = {
  message: _command.flags.string({
    char: 'm',
    description: 'The unique identifier of the message you want to flag.',
    required: false
  }),
  json: _command.flags.boolean({
    char: 'j',
    description: 'Output results in JSON. When not specified, returns output in a human friendly format.',
    required: false
  })
};
MessageFlag.description = 'Flags a message.';
module.exports.MessageFlag = MessageFlag;