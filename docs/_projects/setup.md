---
title: Setup Guide
subtitle: Learn how to setup b2c-crm-sync using our CLI tooling and deployment commands.  Leveraging b2c-crm-sync, you can integrate your configured B2C Commerce and Salesforce Platform environments in 15 minutes.  That's right; we said it -- 15 minutes.
date: 2021-04-22 21:00:00
description: Learn how to setup b2c-crm-sync using our CLI tooling and deployment commands.  Leveraging b2c-crm-sync, you can integrate your configured B2C Commerce and Salesforce Platform environments in 15 minutes.  That's right; we said it -- 15 minutes.
featured_image: '/images/setup-guide-alt.png'
---

> **Check Back for Detailed Scenario Installation Instructions**<br>
> We'll use these pages to capture more detailed installation and configuration instructions.  While we've made [b2c-crm-sync](https://sfb2csa.link/b2c-crm-sync) easy to deploy -- its deployment capabilities are flexible to support incremental updates to either platform environment.  Check-back for deployment and configuration documentation.
>

### Follow Our Readme.md Setup Guidance
Our [ReadMe.md](https://sfb2csa.link/b2c-crm-sync/readme) is a trustworthy guide to get [b2c-crm-sync](https://sfb2csa.link/b2c-crm-sync) setup in your development environment.  Our plan is to move the deployment details from the ReadMe to these pages.  In the meantime, follow it verbatim -- and you should be up and running fairly quickly.

> Our team leverages the Readme for our own internal deployments and on-boarding.  We make incremental updates based on the feedback our peers and extended teams provide.  If you run into issues or have recommendations on how to make it better, please feel free to [create an issue](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues/new) or [start a discussion](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/discussions/new) to share your feedback.


### Deploy to a B2C Commerce Sandbox and a Salesforce scratchOrg in 15 Minutes or Less
Following the guidance in our [ReadMe.md](https://sfb2csa.link/b2c-crm-sync/readme), you can consistently deploy b2c-crm-sync in just a few minutes.  The deployment capabilities are specifically designed to leverage the CI tooling available for B2C Commerce and the Salesforce Platform.
- Deploy to any accessible B2C Commerce environment leveraging [SFCC-CI](https://github.com/SalesforceCommerceCloud/sfcc-ci) and its Node.js APIs.  We also leverage B2C Commerce OCAPI Data REST APIs designed to support CI activities for scenarios SFCC-CI does not natively support.
- Deploy to Salesforce Platform Developer scratchOrgs leveraging [SFDX](https://developer.salesforce.com/tools/sfdxcli) -- Salesforce's command line interface designed to simplify development and build automation.
- Our CLI tooling dynamically generates meta-data for B2C Commerce and the Salesforce Platform describing service, namedCredential, and connectedApp definitions.  This meta-data is then deployed using both CI toolsets.

You can learn more about [B2C Commerce On-Demand Sandboxes](https://sfb2csa.link/trailhead/ods) and [Salesforce DX](https://trailhead.salesforce.com/en/content/learn/modules/sfdx_app_dev) on Trailhead.

### Our Deployment Tooling Leverages Node.js
Node.js is a requirement for SFCC-CI and SFDX.  It is also a requirement for our CLI / Deployment Tooling.  We require Node.js v15.2.1 (or similar) -- and the [Readme.md](https://sfb2csa.link/b2c-crm-sync/readme) contains guidance on how to use [nvm to setup multiple versions of node.js](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#nodejs-setup-instructions).  We **strongly recommend** using nvm to manage your node.js environment(s).

### The Deployment is Governed by Your .env File
We leverage the [dotenv](https://medium.com/@thejasonfile/using-dotenv-package-to-create-environment-variables-33da4ac4ea8f) node.js library to centralize the configuration details for each environment.  You can view a [sample of the .env](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/sample.env) file in our repository.

### The ReadMe is a Trustworthy Guide

The [Readme.md](https://sfb2csa.link/b2c-crm-sync/readme) explains how to progressive [configure your .env file](https://github.com/sfb2csolutionarchitects/b2c-crm-sync#setup-a-env-file) as you work through the deployment process.  To deploy b2c-crm-sync:

> Remember, use our [Readme.md](https://sfb2csa.link/b2c-crm-sync/readme) to guide you through the deployment process.  These instructions are designed to share with you what deployments are like.  Today, they are not designed to support the actual deployment.

- Collect your [B2C Commerce environment access and authentication details](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#setup-a-env-file)
- Write these details to the .env file
- [Configure the OCAPI permissions](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#configure-your-b2c-commerce-ocapi-permissions) to support the API usage required by the b2c-crm-sync deployment tools and the Salesforce Platform Services that leverage B2C Commerce Shop APIs, Data APIs, and WEBDAV access.
- [Define the type of scratchOrg](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#setup-scratchorg-creation-and-management-preferences) you'd like (either Accounts / Contacts or PersonAccounts).  We currently support these two scratchOrg configurations, but our deployment tooling can be customized to support other org-shapes.
- Verify your [B2C Commerce environment details](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#deployment-instructions) using our deployment tooling.  Confirm your details are accurate before building your Salesforce Platform scratchOrg.

```bash
npm run crm-sync:b2c:verify
```

- Build your Salesforce Platform scratchOrg leveraging our deployment tooling.  This will generate custom metadata representing your B2C Commerce environment and deploy it once the scratchOrg has been created.  The deployment tooling will output the scratchOrg details and deployment status as each command completes.

```bash
npm run crm-sync:sf:build
```

> ScratchOrg deployment takes anywhere from three to seven minutes.  This includes the creation of the scratchOrg as well as the deployment of the b2c-crm-sync meta-data.  Be patient while waiting, and try not to stare at the cursor too much while you wait.

- [Update your .env file with the scratchOrg details](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#setup-scratchorg-authentication-credentials) and user details required to login to the scratchOrg.  As part of this, reset your securityToken before deploying to B2C Commerce.
- Log into your scratchOrg, and enable integration for your B2C Instance.  You can validate integration is configured successfully by seeding the CustomerLists and Sites present in your B2C Instance using our Lightning App quickActions.
- Configure your [Match and Duplicate rules](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#salesforce-customer-360-platform-configuration-instructions) based on your customerModel configuration (either [Accounts and Contacts](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#account--contact-match-rules-setup-guidance) or [PersonAccounts](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/blob/master/README.md#personaccount-match-rules-setup-guidance)).
- Verify your Salesforce scratchOrg configuration details via our deployment tooling.  Once you've confirmed that you're credentials are trustworthy, you can kick-off the B2C Commerce build process.

```bash
npm run crm-sync:sf:auth:usercreds
```

- The B2C Commerce build process will leverage the .env configuration properties for B2C Commerce and your scratchOrg to generate service definitions for each configured B2C Commerce site.  These definitions will then be deployed and imported.  Launch the B2C Commerce Build process via out deployment tooling.

```bash
npm run crm-sync:b2c:build
```

- Once the deployment is successful, you can validate the capabilities of b2c-crm-sync by executing the multi-cloud unit tests.  These tests exercise the headless capabilities of b2c-crm-sync and test both B2C Commerce and Salesforce Platform REST APIs.

```bash
npm run crm-sync:test:use-cases
```

> Please keep in mind that our unit-tests take about five minutes to run from beginning to end.  We have over forty tests that exercise registration, authentication, profile updates, and progressive resolution scenarios.

### Use SFDX to Deploy b2c-crm-sync to A Salesforce Org
You can use SFDX to [deploy b2c-crm-sync to any Salesforce Org](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_develop_any_org.htm).  Use the Salesforce DX Developer Guide page to understand the differences that exist with Org deployments vs. scratchOrg deployments.

If you understand these differences, you can leverage our build commands to generate new meta-data for your Org -- and deploy it with native SFDX commands:

```bash
sfdx force:source:deploy -p path/to/source
```

> We have plans to extend out deployment tooling to [natively support non-scratchOrg deployments](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues/53).  You can subscribe to this issue if you'd like updates on its status.
