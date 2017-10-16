let _module = ({ _, shelljs, bluebird, agent }) => {
  if (_.any([_, bluebird, shelljs, agent], _.isUndefined)) {
    throw "Missing dependency";
  }

  let execAsync = cmd => {
    return new bluebird(resolve => {
      shelljs.exec(cmd, { async: true, silent: true }, (code, stdout) => {
        resolve({ code, stdout });
      });
    });
  };

  let extractExercises = json => {
    json = _.flatten(_.map(json.chapters, c => c.sequentials));
    json = _.flatten(_.map(json, c => c.verticals));
    json = _.filter(json, v => v.type === "exercise");
    return json;
  };

  let $ = it => JSON.stringify(it, 0, 4);

  let packet = exe => {
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

  let testSolution = (endpoint, exercise) => {
    return agent
      .post(endpoint)
      .set("Accept", "application/json")
      .send(packet(exercise))
      .end();
  };

  return {
    readHelp: () => {
      return execAsync("cat ../docs/usage.md");
    },
    execAsync: execAsync,
    extractExercises: extractExercises,
    testSolution: testSolution,
    packet: packet
  };
};
module.exports = _module;
