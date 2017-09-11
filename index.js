const commit = require('./commands/commit');
const commitments = require('./commands/commitments');
const checkup = require('./commands/checkup');

module.exports = (hook) => {
  const {res, env, params} = hook;

  if('token' in params && params.token === env.VERIFY) {
    switch(params.command) {
      case '/commit':
        return commit(hook);
      case '/commitments':
        return commitments(hook);
      case '/checkup':
        return checkup(hook);
      default:
        res.end('invalid command');
    }

  } else {
    res.statusCode = 403;
    res.statusMessage = 'Forbidden';
    res.end('denied');
  }
};
