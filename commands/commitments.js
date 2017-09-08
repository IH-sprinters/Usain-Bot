const Sugar = require('sugar');
const slack = require(__dirname + '/../slack');

module.exports = (hook) => {
  const {respond, post, reply, error} = slack(hook);

  respond('looking up the outstanding commitments');

  const rule = hook.params.text.length ? hook.params.text.split(' ') : ['future'];

  const hasRule = (str) => rule.indexOf(str) >= 0;
  const getTime = (date) => (new Date(date)).getTime();

  hook.datastore.get('commitments', (err, commitments) => {
    if(err) {
      return error('failed to fetch the commitments');
    }

    const users = {};
    for(const commitment of commitments) {
      if(!(commitment.user_name in users)) {
        users[commitment.user_name] = {
          name: commitment.user_name,
          commitments: [],
        };
      }

      users[commitment.user_name].commitments.push(commitment);
    }

    const showAll = rule.find(r => r.match(/^@/)) ? false : true;
    const userBlocks = Object.keys(users).sort().map(k => users[k]);

    let message = "these are the commitments I found:\n";
    for(const user of userBlocks) {
      // only show this person if we're showing everyone or this person is included in the list
      if(!(showAll || hasRule(`@${user.name}`))) {
        continue;
      }

      message += `*${user.name}*` + "\n";
      for(const commitment of user.commitments) {
        const isPast = (getTime(commitment.deadline) <= Date.now());
        const isFuture = (getTime(commitment.deadline) > Date.now());

        if(hasRule('all') || (isPast && hasRule('past')) || (isFuture && hasRule('future'))) {
          message +=  `by ${Sugar.Date(commitment.deadline).medium()}: ${commitment.message}` + "\n";
        }
      }
    }

    reply(message, () => hook.res.end());
  });
};