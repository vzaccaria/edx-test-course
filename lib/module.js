'use strict';

var _module = function _module(_ref) {
    var _ = _ref._;
    var shelljs = _ref.shelljs;
    var bluebird = _ref.bluebird;
    var agent = _ref.agent;

    if (_.any([_, bluebird, shelljs, agent], _.isUndefined)) {
        throw "Missing dependency";
    }

    var execAsync = function execAsync(cmd) {
        return new bluebird(function (resolve) {
            shelljs.exec(cmd, { async: true, silent: true }, function (code, stdout) {
                resolve({ code: code, stdout: stdout });
            });
        });
    };

    var extractExercises = function extractExercises(json) {
        json = _.flatten(_.map(json.chapters, function (c) {
            return c.sequentials;
        }));
        json = _.flatten(_.map(json, function (c) {
            return c.verticals;
        }));
        json = _.filter(json, function (v) {
            return v.type === 'exercise';
        });
        return json;
    };

    var $ = function $(it) {
        return JSON.stringify(it, 0, 4);
    };

    var packet = function packet(exe) {
        return {
            xqueue_body: $({

                student_info: $({
                    anonimized_id: 3281
                }),

                student_response: exe.code.solution,
                grader_payload: exe.grader_payload
            })
        };
    };

    var testSolution = function testSolution(endpoint, exercise) {
        return agent.post(endpoint).set('Accept', 'application/json').send(packet(exercise)).end();
    };

    return {
        readHelp: function readHelp() {
            return execAsync('cat ../docs/usage.md');
        },
        execAsync: execAsync,
        extractExercises: extractExercises,
        testSolution: testSolution,
        packet: packet
    };
};
module.exports = _module;