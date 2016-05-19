/*eslint quotes: [0] */

"use strict";

var chai = require('chai');
chai.use(require('chai-as-promised'));
var should = chai.should();
var expect = chai.expect;
var _ = require('lodash');
require('babel-polyfill');

var debug = require('debug');
var bluebird = require('bluebird');
var shelljs = require('shelljs');
var fs = require('fs');
var mm = require('mm');

var agent = require('superagent-promise')(require('superagent'), bluebird);

var z = require('zaccaria-cli');
var promise = z.$b;

/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */
function exec(cmd) {
    "use strict";

    return new promise(function (resolve, reject) {
        require('shelljs').exec(cmd, {
            async: true,
            silent: true
        }, function (code, output) {
            if (code !== 0) {
                reject(output);
            } else {
                resolve(output);
            }
        });
    });
}

mm.restore();

/*global describe, it, before, beforeEach, after, afterEach */

describe('#command', function () {
    "use strict";

    it('should show help', function () {
        var usage = fs.readFileSync(__dirname + '/../docs/usage.md', 'utf8');
        return exec(__dirname + '/../lib/index.js -h').should.eventually.contain(usage);
    });
});

describe('#module', function () {
    var record = {};
    var _module = require('./module');
    _module = _module({
        debug: debug, _: _, shelljs: shelljs, bluebird: bluebird, agent: agent
    });
    "use strict";
    it('should try to read help on readHelp', function () {

        record = {};
        mm(shelljs, 'exec', function (c, opts, cb) {
            record.commandExecuted = c;
            cb(0, 'file contents');
        });

        return _module.readHelp().then(function (v) {

            expect(record).to.contain({
                commandExecuted: "cat ../docs/usage.md"
            });
            expect(v).to.deep.equal({ code: 0, stdout: 'file contents' });
        });
    });
});

describe('#parse', function () {
    var record = {};
    var _module = require('./module');
    _module = _module({
        debug: debug, _: _, shelljs: shelljs, bluebird: bluebird, agent: agent
    });
    var f = shelljs.cat(__dirname + '/../fixtures/course.json');
    f = JSON.parse(f);

    "use strict";
    it('should read fixture', function () {
        return expect(_module.extractExercises(f).length).to.be.equal(14);
    });
    it('should encode a packet', function () {
        var xs = _module.extractExercises(f);
        var packet = _module.packet(xs[0]);
        return expect(packet).to.have.property('xqueue_body');
    });
});