const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const axios = require("axios");

async function run() {
  try {
    // Get inputs
    console.log('getting inputs')
    const mandatory = core.getInput('mandatory');
    const rollout = core.getInput('rollout');
    const from = core.getInput('from');
    const to = core.getInput('to');
    const iOSAppName = core.getInput('iOSAppName');
    const androidAppName = core.getInput('androidAppName');

    // Make network requests
    console.log('network attempts')
    const iosResult = await promote(iOSAppName, mandatory, rollout, from, to)
    console.log(`iOS Promote ${iosResult.data}`);
    const androidResult = await promote(androidAppName, mandatory, rollout, from, to)
    console.log(`Android Promote ${androidResult.data}`);

    // Extract info from responses
    const binary = iosResult.data.target_binary_range.replace(/[<>~]+/,'')
    const label = iosResult.data.label
    const originalLabel = iosResult.data.original_label

    // New Variables
    const tagName = `PRODUCTION-${binary}-${label}(${originalLabel})`
    const releaseName = `${binary}${label}`

    // Release and Tag
    const github = new GitHub(process.env.GITHUB_TOKEN);
    const release = await github.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name: tagName,
      target_commitish: context.sha,
      name: releaseName,
      body: releaseName,
      draft: 'false',
      prerelease: 'false'
    });

    core.setOutput('releaseName', releaseName);
    core.setOutput('releaseTag', tagName);
    core.setOutput('releaseUrl', release.data.html_url);

  } catch (error) {
    core.setFailed("Error message:", error.message);
  }
}

function promote(appName, mandatory, rollout, from, to) {
  const url = `https://api.appcenter.ms/v0.1/apps/Phorest/${appName}/deployments/${from}/promote_release/${to}`
  const data = {
    isMandatory: mandatory,
    rollout: rollout
  }
  const headers = {
    "X-API-Token": process.env.APPCENTER_TOKEN,
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
  console.log(`POST ${url} ${data}`)

  return axios.post(url, data,{headers})
}

run()


