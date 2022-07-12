# CodePush Promote Action

This action promotes latest CodePush label from an ENV to another.

## Inputs

## `mandatory`

A boolean indicating if the version is mandatory or not. Default `"false"`.

## `rollout`

A string indicating the percentage of the rollout. Default `"100"`.

## `from`

A string indicating the `"from"` CodePush env, i.e. `"DEV"` 

## `to`

A string indicating the `"to"` CodePush env, i.e. `"PROD"`

## `iOSAppName`

A string indicating the CodePush iOS app name

## `androidAppName`

A string indicating the CodePush Android app name

## Outputs

## `releaseTag`

The tag of the release


## `releaseName`

The name of the release

## `releaseUrl`

The url of the release


## Example usage

    uses: actions/cp-promote-action@v1.0
    with:
        mandatory: 'false'
        rollout: '100'
        from: 'STAG'
        to: 'PROD'
        iOSAppName: 'PhorestGo-iOS'
        androidAppName: 'PhorestGo-Android'
    env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        APPCENTER_TOKEN: ${{ secrets.APPCENTER_TOKEN }}
