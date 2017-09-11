const commit = require('./commands/commit');
const commitments = require('./commands/commitments');
const remind = require('./commands/remind');

module.exports = (hook) => {
  const {res, env, params} = hook;

  if('token' in params && params.token === env.VERIFY) {
    switch(params.command) {
      case '/commit':
        return commit(hook);
      case '/commitments':
        return commitments(hook);
        case '/remind':
          return remind(hook);
    }

  } else {
    res.statusCode = 403;
    res.statusMessage = 'Forbidden';
    res.end('denied');
  }
};
