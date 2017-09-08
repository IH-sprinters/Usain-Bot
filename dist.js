module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("sugar");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const request = __webpack_require__(4);

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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const commit = __webpack_require__(3);
const commitments = __webpack_require__(5);

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Sugar = __webpack_require__(0);
const slack = __webpack_require__(1);

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

  if((new Date(deadline)).getTime() < Date.now()) {
    const timeTravellers = [
      '"Doc" Brown',
      'Doctor Who',
      'Bill and/or Ted',
    ];

    const you = timeTravellers[Math.floor(Math.random() * timeTravellers.length)];
    return error(`This deadline would be in the past! Who do you think you are, ${you}?`);
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

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const Sugar = __webpack_require__(0);
const slack = __webpack_require__(1);

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

/***/ })
/******/ ]);