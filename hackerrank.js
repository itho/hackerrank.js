"use strict";

const fs = require("fs");
const ora = require("ora");
const path = require("path");
const Promise = require("bluebird");
const { fork } = require("child_process");

const term = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",
};

main();

function main () {
  checkArgs();

  // set path & file variables
  let challengePath = path.join(__dirname, process.argv[2]);
  if (challengePath.charAt(challengePath.length - 1) != '/')
    challengePath = challengePath + "/";
  let challenge = process.argv[2].slice(11);
  let scriptName = "solution.js";
  let inputPath = challengePath + "input/";
  let outputPath = challengePath + "output/";
  // create results directory if it doesn't exist
  let resultsPath = null;
  if (process.argv[3] == "--file") {
    resultsPath = challengePath + "results/";
    if (!fs.existsSync(resultsPath)) fs.mkdirSync(resultsPath);
  } else if (process.argv[3] == "--console" || process.argv[3] == "--stdout") {
    resultsPath = false;
  } else {
    console.log(term.FgRed, "You must specify the output format of your code.");
    console.log(term.FgRed, "Usage: node " + process.argv[1] + " challenges/CHALLENGE-NAME [--console|--file|--stdout]");
    process.exit(1);
  }
  
  // get input & output file names
  let inputFileNames = [];
  let outputFileNames = [];
  fs.readdirSync(inputPath).forEach(file => {
    inputFileNames.push(file);
  });
  fs.readdirSync(outputPath).forEach(file => {
    outputFileNames.push(file);
  });

  compareIO(inputFileNames, outputFileNames);
  logStart(challenge, inputFileNames.length);

  // LOOP THROUGH
  let testcases = [];

  for (let i = 0; i < inputFileNames.length; i++) {
    testcases[i] = {
      name: inputFileNames[i],
      script: challengePath + scriptName,
      input: fs.readFileSync(inputPath + inputFileNames[i], "utf8"),
      output: fs.readFileSync(outputPath + outputFileNames[i], "utf8"),
      resultFile: (resultsPath) ? resultsPath + outputFileNames[i] : false
    };
  }

  testcases = testcases.map(testcase => {
    return runTestcase.bind(null, testcase);
  });

  return Promise.map(testcases, testcase => {
    return testcase();
  })
    .then(result => {
      console.log();
      if (result.every(r => r === true)) {
        console.log(term.FgGreen, " Success! (" + inputFileNames.length + ")");
      } else {
        let failures = [];
        for (let i = 0; i < inputFileNames.length; i++) {
          if (!result[i])
            failures.push(inputFileNames[i]);
        }
        console.log(term.FgRed, " Failed (" + failures.length + "):", failures.join(", "));
      }
      console.log();
    });
}

// Ensure folder path provided.
function checkArgs () {
  if (process.argv.length < 3) {
    console.log(
      term.FgRed,
      "Usage: node " + process.argv[1] + " challenges/CHALLENGE-NAME [--console|--file|--stdout]"
    );
    process.exit(1);
  }

  if (process.argv.length < 4) {
    console.log(
      term.FgRed,
      "You must specify the output format of your code."
    )
    console.log(
      term.FgRed,
      "Usage: node " + process.argv[1] + " challenges/CHALLENGE-NAME [--console|--file|--stdout]"
    );
    process.exit(1);
  }
}

// Ensure matching inputs/outputs.
function compareIO(inputFileNames, outputFileNames) {
  let match = true;
  for (let i = 0; i < inputFileNames.length; i++) {
    if (inputFileNames[i].slice(5) != outputFileNames[i].slice(6)) {
      match = false;
      break;
    }
  }

  if (!match) {
    console.log(
      term.FgRed,
      "Error: number of inputs does not match number of outputs."
    );
    process.exit(1);
  }
}

function logStart (challenge, testcases) {
  console.log(
    term.Reset,
    " Running HackerRank Challenge:",
    term.FgMagenta,
    challenge,
    term.Reset,
    "with",
    term.FgGreen,
    testcases,
    term.Reset,
    "testcases."
  );
  console.log();
}

function runTestcase (testcase) {
  return new Promise(function (resolve, reject) {
    let stdout = (!testcase.resultFile);
    let args = (testcase.resultFile)
      ? { env: { OUTPUT_PATH: testcase.resultFile }, stdio: ["pipe", "pipe", "pipe", "ipc"] }
      : { stdio: ["pipe", "pipe", "pipe", "ipc"] };

    const spinner = ora(testcase.name).start();
    let child = fork(testcase.script, [], args);

    let result = "";
    if (stdout) {
      child.stdout.on('data', function (data) {
        result += data.toString();
      });
    }

    child.stdin.setEncoding("utf-8");
    child.stdin.write(testcase.input);
    child.stdin.end();

    child.on("error", function(err) {
      spinner.warn();
      reject(err.toString());
    });

    child.on("exit", function() {
      let outcome = (!stdout)
        ? fs.readFileSync(testcase.resultFile, "utf8").toString()
        : result;

      if (outcome.replace("\n", "") == testcase.output.replace("\n", "")) {
        spinner.succeed();
        resolve(true);
      } else {
        spinner.fail();
        console.log(term.FgRed, " - Expected Output:", testcase.output.replace("\n", ""));
        console.log(term.FgRed, " - Your Output:    ", outcome.replace("\n", ""));
        resolve(false);
      }
    });
  });
}
