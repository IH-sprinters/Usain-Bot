const { authenticate } = require('./functions');
const commit = require('./commands/commit');
const commitments = require('./commands/commitments');

module.exports = (hook) => {
  const {res, env, params} = hook;

  if('token' in params && params.token === env.VERIFY) {
    switch(params.command) {
      case '/commit':
        return commit(hook);
      case '/commitments':
        return commitments(hook);
    }

  } else {
    res.statusCode = 403;
    res.statusMessage = 'Forbidden';
    res.end('denied');
  }
};
