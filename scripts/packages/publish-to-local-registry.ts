import execa from "execa";
import sleep from "sleep-promise";
import path from "path";
import os from "os";
import { logStepEnd, logStepStart } from "../shared/logging";

// These variables are hardcoded on purpose. We don’t want to accidentally push to a real registry.
const npmRegistry = "http://localhost:4873";
const npmUserAndPassword = "verdaccio";
const npmEmail = "verdaccio@example.com";

const packageNames = [
  "block-template",
  "blockprotocol",
  "create-block-app",
  "mock-block-dock",
];

const defaultExecaOptions = {
  env: {
    HOME: process.env.HOME,
    NODE_ENV: "development",
    NPM_CONFIG_REGISTRY: npmRegistry,
    PATH: process.env.PATH,
    USERPROFILE: process.env.USERPROFILE,
  },
  extendEnv: false,
  stdio: "inherit",
} as const;

const script = async () => {
  console.log("~~~~~");
  console.log("homedir");
  console.log(os.homedir());
  console.log("process.env keys");
  console.log(Object.keys(process.env).join("\n"));
  console.log("~~~~~");

  logStepStart("Login into local registry");

  const addUserProcess = execa("npm", ["adduser"], {
    ...defaultExecaOptions,
    stdio: undefined,
    stdout: "inherit",
  });

  // Execa does not support multiple prompts, so using sleep to enter credentials
  // https://github.com/sindresorhus/execa/issues/418
  await sleep(500);
  addUserProcess.stdin?.write(`${npmUserAndPassword}\n`);
  await sleep(500);
  addUserProcess.stdin?.write(`${npmUserAndPassword}\n`);
  await sleep(500);
  addUserProcess.stdin?.write(`${npmEmail}\n`);
  await addUserProcess;

  logStepEnd();

  for (const packageName of packageNames) {
    const packageDirPath = path.resolve(`packages/${packageName}`);

    logStepStart(`Unpublish ${packageName} from local registry (if present)`);

    await execa("npm", ["unpublish", "--force"], {
      ...defaultExecaOptions,
      cwd: packageDirPath,
      reject: false,
    });

    logStepEnd();
    logStepStart(`Publish ${packageName} to local registry`);

    await execa("npm", ["publish", "--force"], {
      ...defaultExecaOptions,
      cwd: packageDirPath,
    });

    logStepEnd();
  }
};

void script();
