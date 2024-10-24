const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const context = github.context;

async function run() {
  try {
    // Get inputs
    console.log("Getting inputs");
    const mandatory = core.getInput("mandatory");
    console.log("mandatory:", mandatory);
    const rollout = core.getInput("rollout");
    console.log("rollout:", rollout);
    const from = core.getInput("from");
    console.log("from:", from);
    const to = core.getInput("to");
    console.log("to:", to);
    const create_release = core.getInput("create_release");
    console.log("create_release:", create_release);

    // Envs
    const iOSAppName = process.env.IOS_APP_NAME;
    console.log("iOSAppName:", iOSAppName);
    const androidAppName = process.env.ANDROID_APP_NAME;
    console.log("androidAppName:", androidAppName);

    // Make network requests
    // console.log("Network requests to MS AppCenter CodePush");
    // const iosResult = await promote(iOSAppName, mandatory, rollout, from, to);
    // console.log("iOS Promote result:", iosResult.data);
    const androidResult = await promote(
      androidAppName,
      mandatory,
      rollout,
      from,
      to
    );
    console.log("Android Promote result:", androidResult);

    // if (create_release === "false") {
    //   return;
    // }
    //
    // // Extract info from responses
    // const binary = iosResult.data.target_binary_range.replace(/[<>~]+/, "");
    // const label = iosResult.data.label;
    // const originalLabel = iosResult.data.original_label;
    //
    // // New Variables
    // const tagName = `PRODUCTION-${binary}-${label}(${originalLabel})`;
    // const releaseName = `${binary}${label}`;
    //
    // // Release and Tag
    // const git = github.getOctokit(process.env.GITHUB_TOKEN);
    // const { owner, repo } = context.repo;
    //
    // const releases = await git.rest.repos.listReleases({ owner, repo });
    //
    // let release_id;
    // if (releases && releases.data.length > 0) {
    //   release_id = releases.data.find((r) => r.draft === true).id;
    // }
    //
    // let release;
    // if (release_id) {
    //   release = await git.rest.repos.updateRelease({
    //     release_id,
    //     owner,
    //     repo,
    //     tag_name: tagName,
    //     target_commitish: context.sha,
    //     name: releaseName,
    //     draft: false,
    //     prerelease: false,
    //   });
    // } else {
    //   release = await git.rest.repos.createRelease({
    //     owner,
    //     repo,
    //     tag_name: tagName,
    //     target_commitish: context.sha,
    //     name: releaseName,
    //     draft: false,
    //     prerelease: false,
    //   });
    // }
    // core.setOutput("releaseName", releaseName);
    // core.setOutput("releaseTag", tagName);
    // core.setOutput("releaseUrl", release.data.html_url);
    //
    // console.log("Created release:", releaseName);
    // console.log("Created tag:", tagName);
  } catch (error) {
    console.log("Full error", error);
    core.setFailed(error.message);
  }
}

function promote(appName, mandatory, rollout, from, to) {
  console.log(process.env.APPCENTER_TOKEN, process.env.CI_TOKEN)
  // If no appcenter token is provided and there is a ci token, then we know to use the phorest codepush cli
  if (!process.env.APPCENTER_TOKEN && process.env.CI_TOKEN) {
    async function cliPromotion() {
      await exec('yarn code-push register-ci');
      await exec(`yarn code-push promote ${appName} ${from} ${to}`);
      const { stdout } = await exec(`yarn code-push deployment history ${appName} ${to} --format json`);
      console.log(stdout);
      return JSON.parse(`[${stdout.split('[')[1].split(']')[0]}]`);
    }
    return cliPromotion();
  }

  const url = `https://api.appcenter.ms/v0.1/apps/Phorest/${appName}/deployments/${from}/promote_release/${to}`;
  const data = {
    is_mandatory: mandatory === "true",
    rollout: parseInt(rollout),
  };
  const headers = {
    "X-API-Token": process.env.APPCENTER_TOKEN,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  console.log(`POST ${url} ${JSON.stringify(data)}`);

  return axios.post(url, data, { headers });
}

run();
