const commit = require(__dirname + '/commands/commit');
const commitments = require(__dirname + '/commands/commitments');

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
