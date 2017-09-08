const Sugar = require('sugar');
const request = require('request');
const slack = require('../slack');

// matches a deadline (either a single word, or quoted string) and a message. e.g.:
// today complete some task
// "8th September" complete some task
const COMMAND_REGEX = /^("(?:\\"|[^"])+"|\S+) (.+)$/;

module.exports = (hook) => {
  const {respond, post, reply, error} = slack(hook);

  respond('posting your commitment...');
  
  const command = hook.params.text.match(COMMAND_REGEX);
  if(!command || command.length < 2) {
    return error("Sorry, I'm afraid I didn't understand that");
  }
  
  const deadline = Sugar.Date.create(command[1].replace(/^"|"$/g, ''));
  if(!deadline) {
    return error("Sorry, I couldn't parse your deadline - I use Sugar (https://sugarjs.com) to parse dates");
  }
  
  hook.datastore.get('commitments', (err, _commitments) => {
    try {
      if(err) {
          return error('Failed to retrieve the list of commitments');  
      }
      
      const commitment = {
        deadline: deadline,
        created: Date.now(),
        message: command[2],
        user_id: hook.params.user_id,
        user_name: hook.params.user_name,
      };

      const commitments = _commitments || [];
      commitments.push(commitment);

      hook.datastore.set('commitments', commitments, (err) => {
        try {
          if(err) {
            return error('Failed to save your commitment to the datastore');
          }
          
          post(`@${commitment.user_name} just committed to ${commitment.message} by ${Sugar.Date(deadline).medium()}`);
          reply(`I've posted your commitment to ${command[2]} by ${command[1]} (${Sugar.Date(deadline).medium()}). ${"\n"}I'll post again on that date to see how it went!`, () => {
            hook.res.end();
          });
          
        } catch(e) {
          console.log(e.message);
          return error('something went wrong!');
        }
      });
      
    } catch(e) {
      console.log(e.message);
      console.log(e.stack);
      return error('something went wrong!');
    }
  });
};