'use strict';

/* eslint quotes: [0], strict: [0] */

var _require =
// $r.stdin() -> Promise  ;; to read from stdin
require('zaccaria-cli');

var _ = _require._;
var $d = _require.$d;
var $o = _require.$o;
var $fs = _require.$fs;
var $b = _require.$b;
var $s = _require.$s;


var path = require('path');

var debug = require('debug');
var shelljs = $s;
var bluebird = $b;

var _require2 = require('./messages');

var error = _require2.error;
var ok = _require2.ok;
var info = _require2.info;
var warn = _require2.warn;


var readLocal = function readLocal(f) {
    var curdir = path.dirname($fs.realpathSync(__filename));
    var filepath = path.join(curdir, '../' + f);
    return $fs.readFileAsync(filepath, 'utf8');
};

var getOptions = function getOptions(doc) {
    "use strict";

    var o = $d(doc);
    var help = $o('-h', '--help', false, o);
    var all = o.all;
    var justone = o.justone;
    var dir = o.DIR;
    var endpoint = o.ENDPOINT;
    var num = o.NUM;
    return {
        help: help,
        dir: dir,
        endpoint: endpoint,
        all: all,
        justone: justone,
        num: num
    };
};

var agent = require('superagent-promise')(require('superagent'), bluebird);

var _module = require('./module');
_module = _module({
    debug: debug,
    _: _,
    shelljs: shelljs,
    bluebird: bluebird,
    agent: agent
});

var _module2 = _module;
var execAsync = _module2.execAsync;
var extractExercises = _module2.extractExercises;
var testSolution = _module2.testSolution;
var packet = _module2.packet;


var _gl = function _gl(s) {
    return s.split("\n")[0];
};

function testIt(endpoint) {
    return function (it, num) {
        return testSolution('http://' + endpoint + '/payload', it).then(function (r) {
            if (r.body.correct) {
                ok(num + ': ' + _gl(it.code.solution));
            } else {
                error(num + ': ' + it.code.solution + ' ==> ' + it.code.validation);
            }
        });
    };
}

var main = function main() {
    readLocal('docs/usage.md').then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var dir = _getOptions.dir;
        var endpoint = _getOptions.endpoint;
        var all = _getOptions.all;
        var justone = _getOptions.justone;
        var num = _getOptions.num;

        if (help) {
            console.log(it);
        } else {
            execAsync('npm bin').then(function (bin) {
                execAsync('SILENT=1 ' + bin + '/gitbook3toedx json ' + dir).then(function (_ref) {
                    var stdout = _ref.stdout;
                    return JSON.parse(stdout);
                }).then(extractExercises).then(function (xs) {
                    if (justone) {
                        testIt(endpoint)(xs[num], num);
                    } else if (all) {
                        bluebird.all(_.map(xs, testIt(endpoint)));
                    }
                });
            });
        }
    });
};

module.exports = _.assign({
    main: main
}, _module);