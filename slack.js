module.exports = (hook) => {
  const {res, env, params} = hook;

  const respond = (msg) => {
    res.writeHead(200, {'Content-Length': msg.length});
    res.write(msg);
  };
  
  const post = (msg) => request({
    method: 'POST',
    uri: env.POST_URL,
    json: true,
    body: {
      text: msg
    },
  });
  
  const reply = (msg, cb) => request({
    method: 'POST',
    uri: params.response_url,
    json: true,
    body: {text: msg},
  }, cb);
  
  const error = (msg) => {
    reply(msg);
  };

  return {respond, post, reply, error};
};