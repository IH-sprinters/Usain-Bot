const Sugar = require('sugar');
const slack = require('../slack');

module.exports = (hook) => {
  const {respond, post, reply, error} = slack(hook);

  hook.datastore.get('commitments', (err, commitments) => {
    if(err) {
      return error('Failed to retrieve the list of commitments');  
    }

    for(const commitment of commitments) {
      const deadline = commitment.deadline && (new Date(commitment.deadline)).getTime();
      const now = Date.now();
      const created = Sugar.Date.create(commitment.created);
      if(deadline && deadline <= now && (now - deadline < 86400000) && !('posted' in commitment)) {
        post(`on ${created.medium()}, @${commitment.user_name} committed to ${commitment.message} by ${deadline.medium()} - how'd it go?`);
        commitment.posted = true;
      }
    }

    hook.datastore.set('commitments', commitments, (err) => {
      if(err) {
        return error('Failed to save your commitment to the datastore');
      }

      hook.res.end();
    });
  });
};
