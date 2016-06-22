/* eslint quotes: [0], strict: [0] */
const {
    _,
    $d,
    $o,
    $fs,
    $b,
    $s
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli');

const path = require('path');

const debug = require('debug');
const shelljs = $s;
const bluebird = $b;

let {
    error,
    ok,
    info,
    warn
} = require('./messages')

let readLocal = f => {
    const curdir = path.dirname($fs.realpathSync(__filename));
    const filepath = path.join(curdir, `../${f}`);
    return $fs.readFileAsync(filepath, 'utf8');
}


const getOptions = doc => {
    "use strict";
    const o = $d(doc);
    const help = $o('-h', '--help', false, o);
    const all = o.all;
    const justone = o.justone;
    const dir = o.DIR;
    const endpoint = o.ENDPOINT;
    const num = o.NUM;
    return {
        help,
        dir,
        endpoint,
        all,
        justone,
        num
    };
}

let agent = require('superagent-promise')(require('superagent'), bluebird);

let _module = require('./module');
_module = _module({
    debug,
    _,
    shelljs,
    bluebird,
    agent
})

let {
    execAsync,
    extractExercises,
    testSolution,
    packet
} = _module;

let _gl = (s) => {
    return s.split("\n")[0];
}

function testIt(endpoint) {
    return function(it,num) {
        return testSolution(`http://${endpoint}/payload`, it).then((r) => {
            if (r.body.correct) {
                ok(`${num}: ${_gl(it.code.solution)}`);
            } else {
                error(`${num}: ${it.code.solution} ==> ${it.code.validation}`);
            }
        });
    }
}

const main = () => {
    readLocal('docs/usage.md').then(it => {
        const {
            help,
            dir,
            endpoint,
            all,
            justone,
            num
        } = getOptions(it);
        if (help) {
            console.log(it);
        } else {
            execAsync(`SILENT=1 ${__dirname}/../node_modules/.bin/gitbook3toedx json ${dir}`)
                .then(({
                    stdout
                }) => JSON.parse(stdout))
                .then(extractExercises)
                .then((xs) => {
                    if (justone) {
                        testIt(endpoint)(xs[num],num)
                    } else if (all) {
                        bluebird.all(_.map(xs, testIt(endpoint)));
                    }
                });
        }
    });
}


module.exports = _.assign({
    main
}, _module);
