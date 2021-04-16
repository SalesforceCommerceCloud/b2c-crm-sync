# Salesforce B2C Commerce / Customer 360 Platform Integration #

## Introduction ##

Salesforce B2C Commerce / CRM Sync is an enablement solution provided by Salesforce Architect Success designed to teach Salesforce's B2C Customer Data Strategy for multi-cloud use-cases.  The solution demonstrates a contemporary view on the integration between Salesforce B2C Commerce and the Salesforce Customer 360 Platform.  This project provides a framework to integrating these two clouds leveraging public REST APIs to share and synchronize customer profile data between the two clouds.

> :warning: &nbsp;This repository is currently a **work-in-progress and should not be considered stable** until a formal release is published.  We're working hard to round-out the MVP feature-set in a trustworthy way.  Please visit our [issues-list](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues) to see outstanding issues and features, and visit our [discussions](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/discussions) to ask questions. &nbsp;:warning:

![Introducing b2c-crm-sync](/docs/images/crm-sync.gif)

## Application Overview ##

###### This section provides a high-level summary of the purpose and architectural structure of the Salesforce B2C Commerce and Salesforce Customer 360 Platform Integration.

The b2c-crm-sync project enables the viewing and management of Salesforce B2C Commerce Customer Profiles within the Salesforce Platform as either Accounts / Contacts or Person Accounts.  The project serves as a contemporary foundation for integration between B2C Commerce and the Salesforce Platform.  It is designed to teach the data strategy used to synchronize B2C Customer Profiles -- and extended to support multi-cloud use-cases between B2C Commerce, Marketing Cloud, and the Salesforce Platform (ex. Service, Sales, Loyalty Cloud, etc).

> Please note that this integration is an 'above the API' integration achieved via REST services -- and is not a low-level platform integration.  Think of this repository as a guide for integrating B2C Commerce and the Salesforce Customer 360 Platform leveraging REST APIs, custom code, and a subset of its declarative features.

The b2c-crm-sync project leverages Salesforce B2C Commerce Open Commerce REST APIs (OCAPI) to interact with B2C Customer Profiles -- and a series of Salesforce Platform REST services to 'announce' when relevant custom profiles B2C Commerce have been created or modified. Through these announcements, the Salesforce Platform requests the identified data objects (ex. customers) via REST APIs -- and then ingests elements of those data objects to create Account / Contact or PersonAccount representations of B2C Commerce Customer Profiles.

### License
This project, its source code, and sample assets are all licensed under the [BSD 3-Clause](License.md) License.

Please remember that this project **should not be treated as Salesforce Product**.  It is an enablement solution designed to teach Salesforce's B2C Customer Data Strategy for B2C multi-cloud use-cases. Customers and partners implement this at-will with no expectation of roadmap, technical support, defect resolution, production-style SLAs.

> Roadmap, enhancements, and defect resolution will be driven by the Salesforce Architect Community.  You are invited to log an issue or submit a pull-request to receive an Architect Success hoodie.

### Support
This repository is maintained and contributed to by the Salesforce Community, Architect Success Team, and the SCPPE and Service Delivery teams within the Customer Success Group (CSG). This repository isn’t supported by Salesforce Commerce Cloud or Salesforce Platform Technical Support. For feature requests or bugs, please open a GitHub issue. Contributions are ALWAYS WELCOME -- and are often rewarded with Architect Success swag.

![Come Get Your Architect Success Hoody](/docs/images/hoody-worthy.gif)

> Please keep in mind that [hoody-worthy](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues?q=is%3Aopen+is%3Aissue+label%3Ahoody-worthy) issues need to solve real business or project problems.  That said -- contribute, let us support you, and collect your swag. It's really that simple. :)

### Feature Summary

The following high-level features are supported by the b2c-crm-sync:

- Configuration of multiple B2C Commerce environments (either Sandboxes or Primary Instance Group environments) within the Salesforce Customer 360 Platform
- Configuration of multiple B2C Commerce CustomerLists and Sites within the Salesforce Customer 360 Platform
- Granular integration control managing which instances, customerLists, and sites can interact with B2C Commerce and receive integration messages
- Supports both PersonAccounts and Account / Contact customer models within the Salesforce Customer 360 Platform
- Synchronization of registered Salesforce B2C Commerce customer profiles between the Salesforce Customer 360 Platform and Salesforce B2C Commerce
- Order on Behalf of style Assisted Shopping for Customer Service Representatives configured and launched from within the Salesforce Platform

### Setup Guidance

#### Deployment Considerations
This repository should be considered a developer framework that can be extended by customers and partners to support their specific implementation needs.  Implementing this solution will require configuration, customization, runtime-performance evaluation, and testing.

> Do NOT deploy this enablement solution directly to a staging or production environment without first going through your development, QA, or CI process.  Remember that this solution is not supported by Salesforce Technical Support.

#### B2C Commerce Setup Instructions

##### Setup a .env file
To begin, we use the [dotenv](https://medium.com/@thejasonfile/using-dotenv-package-to-create-environment-variables-33da4ac4ea8f) node.js library to store environment-specific configuration settings used to authenticate against a given B2C Commerce environment.  Before installing any of the project package dependencies, please follow these instructions to build-out a .env file that contains your environment's configuration settings.

- Rename the example file 'sample.env' to '.env' in the root of the repository.

> This file shouldn't be checked into the repository, and is automatically being ignored by .git

- Open the .env file and edit the following information.  Please update these values to reflect your sandbox environment's configuration properties.

```
######################################################################
## B2C Commerce Configuration Properties
######################################################################
B2C_HOSTNAME=b2csandbox-017.sandbox.us01.dx.commercecloud.salesforce.com
B2C_INSTANCENAME=b2csandbox-017a
B2C_CLIENTID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
B2C_CLIENTSECRET=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
B2C_SITEIDS=RefArch, RefArchGlobal
B2C_CODEVERSION=b2c_crmsync
B2C_DATARELEASE=scc-sampledata
B2C_USERNAME=username@emailaddress.com
B2C_ACCESSKEY=5jL_yWlS~PCPNzFI%54%btqt+Ggo|z[yhno2CMj_
B2C_CERTIFICATEPATH=
B2C_CERTIFICATEPASSPHRASE=
```
The following table describes each of the B2C Commerce specific .env file variables that are leveraged by b2c-crm-sync's build and deployment tools.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  B2C_HOSTNAME |x| Represents the host name portion of the URL for the B2C Commerce environment to which b2c-crm-sync will be deployed |
|  B2C_INSTANCENAME | | Represents a shorthand descriptor for the B2C_HOSTNAME |
|  B2C_CLIENTID |x| Represents the B2C Commerce Account Manager ClientID used to authenticate against the identified B2C Commerce environment.  See [Add an API Client](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_add_api_client_id.html#) for additional information.|
|  B2C_CLIENTSECRET |x| Represents the B2C Commerce Account Manager ClientSecret that corresponds to the identified ClientID|
| B2C_SITEIDS |x| Represents a comma-delimited list of sites to deploy b2c-crm-sync to |
|  B2C_CODEVERSION |x| Represents the B2C Commerce code version to which the b2c-crm-sync's plugin cartridges will be deployed.  See [Manage Code Versions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_managing_code_versions.html#) for additional information.|
|  B2C_DATARELEASE |x| Represents the B2C Commerce data release to be deployed to the specified B2C Commerce environment|
|  B2C_USERNAME |x| Represents the Account Manager username with permissions to access the B2C Commerce environment identified in the hostname |
|  B2C_ACCESSKEY  |x| Represents the B2C Commerce web access key that can be used to authenticate against the specified B2C Commerce environment.  See [Create an Access Key for Logins](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_access_keys_for_business_manager.html#) for additional information.  Choose scope 'WebDAV File Access and UX Studio' for deployments and 'Agent User Login and OCAPI' for OOBO Support.|
|  B2C_CERTIFICATEPATH | | Represents the path to the certificate to use during the two-factor authentication against the B2C Commerce environment Please note this should be used for Staging Environments only: See [Configure Secure Code Uploads](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_secure_code_uploads.html#) for more information.|
|  B2C_CERTIFICATEPASSPHRASE | | Represents the passphrase of the certificate to use during the two-factor authentication against the B2C Commerce environment. Please note this should be used for Staging Environments only: See [Configure Secure Code Uploads](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_secure_code_uploads.html#) for more information.|

The CLI build tools present within this solution will use this information to remotely authenticate against your environment via B2C Commerce REST APIs prior to attempting any import, upload, or re-index activity.  They are also used to automate the creation of Salesforce Platform meta-data describing the B2C Commerce environment and Named Credentials used to access the B2C Commerce instance.

> Prior to saving your file, please verify that the url is correct, and that the clientId / clientSecret are accurate.  The instance name should represent a shorthand nickname for the B2C Commerce environment.  This information must be accurate in order for these activities to successfully process the site-import.

#### Configure Your B2C Commerce OCAPI Permissions
The build scripts in this repository leverage B2C Commerce's [sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci) automation library.  This library is used to perform a number of continuous-integration related activities that enable the site-data uploading and import.  Before we can leverage the automation tasks, the Salesforce B2C Commerce environment's OCAPI Data API permissions must be enabled to support remote interactions.

> Yes, we will be porting this to leverage the new B2C Commerce APIs in a future release.  For now, all use-cases can be satisfied via OCAPI.

##### Configure Your Shop API Permissions

> We leverage the Shop API to facilitate enable Headless use-cases, multi-cloud unit tests that can be executed via the CLI, and to support Assisted Shopping (OOBO) via the B2C Commerce storefront.

- Log into the Business Manager.
- Navigate to Administration > Site Development > Open Commerce API Settings.
- Select 'Shop API' and 'Global' from the available select boxes.
- Add the following permission set for your clientId to the existing configuration settings.  Map your allowed-origins to point to your Salesforce environment (you may have to come back and set this after your scratchOrg is created below).
- Always remember to save your changes and confirm that they've been written to your Business Manager environment.

> Map the OCAPI REST API configuration settings displayed below to the client_id that will be used to facilitate this integration.

```json
{
  "client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "allowed_origins": [
    "https://my-salesforce-environment.visualforce.com",
    "https://my-salesforce-environment.lightning.force.com"
  ],
  "resources": [
    {
        "resource_id": "/customers",
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    },
    {
        "resource_id": "/customers/*",
        "methods": [
            "get",
            "patch"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    },
    {
        "resource_id": "/customers/auth",
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    },
    {
        "resource_id": "/customers/*/auth",
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    },
    {
        "resource_id": "/customers/auth/trustedsystem",
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    },
    {
        "resource_id": "/sessions",
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    },
    {
        "resource_id": "/site",
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "cache_time": 0
    },
    {
        "resource_id": "/orders/*",
        "methods": [
            "get",
            "patch"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    }
  ]
}
```

> Depending on your sandbox configuration, you may need to copy these configuration settings to specific Sites (vs. applying them globally).

##### Configure Your Data API Permissions

> We leverage the Data API to facilitate server-to-server updates from the Salesforce Platform to B2C Commerce.  When a profile representation in the Salesforce Platform is modified, the Data API is used to publish updates to B2C Commerce.

- Select 'Data API' and 'Global' from the available select boxes.
- Add the following permission set for your clientId to the existing configuration settings.  Map your allowed-origins to point to your Salesforce environment (you may have to come back and set this after your scratchOrg is created below).
- Always remember to save your changes and confirm that they've been written to your Business Manager environment.
- If your existing settings are empty, first add the base 'clients' element referenced above

```json
{
  "client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "allowed_origins": [
    "https://my-salesforce-environment.visualforce.com",
    "https://my-salesforce-environment.lightning.force.com"
  ],
  "resources": [
    {
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/sites"
    },
    {
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/sites/*"
    },
    {
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/site_search"
    },
    {
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/code_versions"
    },
    {
        "methods": [
            "get",
            "put",
            "patch",
            "delete"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/code_versions/*"
    },
    {
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/jobs/*/executions"
    },
    {
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/jobs/*/executions/*"
    },
    {
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/customer_lists/*"
    },
    {
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/customer_lists/*/customer_search"
    },
    {
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/customer_lists/*/customers"
    },
    {
        "methods": [
            "get",
            "patch",
            "delete",
            "put"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/customer_lists/*/customers/*"
    },
    {
        "methods": [
            "get",
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/customer_lists/*/customers/*/addresses"
    },
    {
        "methods": [
            "get",
            "patch",
            "delete"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/customer_lists/*/customers/*/addresses/*"
    },
    {
        "methods": [
            "get",
            "patch"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/sites/*/site_preferences/preference_groups/*/*"
    },
    {
        "methods": [
            "post"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/sites/*/cartridges"
    }
  ]
}
```

> Remember to replace the **client_id** and **allowed_origins** examples included here with values that reflect your own security and environment configuration settings.

#### Configure Your B2C Commerce WebDAV Permissions
The build scripts in this repository require that the clientId configured in the .env file also have read / write WebDAV permissions.  Please use the following instructions to configure the WebDAV permissions for your clientId.

- Log into the Business Manager.
- Navigate to Administration > Organization > WebDAV Client Permissions.
- Add the following permission sets for your clientId to the existing configuration settings.

> Remember to replace the 'client_id' with the clientId that is configured in your .env file.  If you already have clientId permissions created, please add the resources outlined in the snippet below to the existing clientId configuration.

```json
{
  "clients":
  [
    {
      "client_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "permissions":[
            {
                "path": "/impex",
                "operations": [
                    "read_write"
                ]
            },
            {
                "path": "/cartridges",
                "operations": [
                    "read_write"
                ]
            },
            {
                "path": "/static",
                "operations": [
                    "read_write"
                ]
            }
      ]
    }
  ]
}
```

### Setup Instructions for the Salesforce Customer 360 Platform

#### Setup ScratchOrg Creation and Management Preferences
All Salesforce Customer 360 Platform code and meta-data can be deployed to a [scratch org leveraging SFDX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx).  CLI commands in this repository support automation of the deployment process, and the .env file can be extended to include additional variables to automate B2C Commerce service and metadata configuration.

> Please use [Trailhead's Quick Start: Salesforce DX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx) as a guide to setup a DevHub that can generate Salesforce scratchOrgs.

- Open the .env file and edit the following information.  Please use these defaults -- and edit them to accommodate your org creation and deployment preferences.

> ScratchOrgs can be configured using the [base](./config-dx/b2c-base-scratch-def.json) or [personaccounts](./config-dx/b2c-personaccounts-scratch-def.json) profiles.   The base profile supports Accounts / Contacts, while the personaccounts profile supports PersonAccounts.

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_SCRATCHORGPROFILE=base
SF_SCRATCHORGALIAS=crmsync
SF_SCRATCHORGSETDEFAULT=true
SF_SCRATCHORGFORCEOVERWRITE=true
SF_SCRATCHORGDURATIONDAYS=7
```
The following table describes each of the Scratch Org specific .env file variables that are leveraged by b2c-crm-sync's build and deployment tools.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_SCRATCHORGPROFILE |x| Represents the scratchOrg profile to leverage when creating an org (use either 'base' or 'personaccounts') |
|  SF_SCRATCHORGALIAS | | Describes the alias to apply to created scratchOrgs |
|  SF_SCRATCHORGSETDEFAULT | | Manages whether any newly created scratchOrgs should automatically be set as the default|
|  SF_SCRATCHORGFORCEOVERWRITE | | Manages whether deployments to a scratchOrg should force overwrite the code and meta-data present in the scratchOrg |
|  SF_SCRATCHORGDURATIONDAYS | | Specify the scratch org's duration, which indicates when the scratch org expires in days (7 - 30). |

The build tools will use this information to create scratchOrgs, set default preferences, and control whether deployments should force overwrites to their target environment.

> Prior to saving your file, please verify that the scratchOrg profile uses one of the two supported values ('base' or 'personaccounts').  Any values not set will automatically default to base preferences managed via the /config/default.js configuration file.

#### Setup ScratchOrg Authentication Credentials
B2C Commerce service definitions pointing to the deployed scratchOrg can be seeded with Salesforce environment authentication credentials.  To support this, please extend the .env file with the following properties representing authentication details for the scratchOrg.

- Open the .env file and edit the following information.  Please update these values to reflect the unique environment and authentication credentials for your scratchOrg.  These values can be used to validate authentication and seed the B2C Commerce service definitions with these details -- eliminating the need to manually configure these services.

> Your Scratch Org will be created below under Deployment Instructions so you may not have these values ready yet, return here and populate after creating your Scratch Org

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=power-dream-1234-dev-ed.lightning.force.com
SF_LOGINURL=test.salesforce.com
SF_USERNAME=test-2enmvjmefudl@example.com
SF_PASSWORD=P@ssw0rd!
SF_SECURITYTOKEN=5aqzr1tpENbIpiWt1E9X2ruOV
```
The following table describes each of the Salesforce Customer 360 Platform's .env file variables that are leveraged by b2c-crm-sync's build and deployment tools to automate the creation of service definitions.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_HOSTNAME |x| Describes the url for the scratchOrg being integrated with a B2C Commerce instance.|
|  SF_LOGINURL |x| Describes the login url used to authenticate against the scratchOrg specified (generally test.salesforce.com)|
|  SF_USERNAME |x| Represents the username of the scratchOrg user|
|  SF_PASSWORD |x| Represents the password of the scratchOrg user.  See [Generate or Change a Password for a Scratch Org User](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_passwd.htm) for additional information. |
|  SF_SECURITYTOKEN |x| Represents the securityToken of the scratchOrg user. You can create or reset the security token from your scratchOrg User Settings under 'Reset My Security Token.'|

The build tools will use this information to create the B2C Commerce service definitions used by it to communicate with the Salesforce scratchOrg.

> Leverage the .env file's configuration properties to dramatically simplify the build and deployment of b2c-crm-sync.  Check the package.json for the complete set of CLI commands that can be used to automate meta-data generation, service definition creation, and validate environment configurations prior to deployment.

### Deployment Instructions
The b2c-crm-sync repository includes a collection of CLI commands that can be used to prepare and deploy the b2c-crm-sync assets to B2C Commerce and a Salesforce Customer 360 Platform scratchOrg.

> Before running any commands below be sure to run 'npm install' from the root of the b2c-crm-sync repository folder

1. Configure the initial collection B2C Commerce OCAPI and WebDAV permissions.  The 'allowed_origins' properties can be set after a Salesforce ScratchOrg has been created.

2. Create the B2C Commerce .env configuration properties.

3. Verify that your B2C Commerce configuration properties are defined accurately in the .env file by executing the following CLI command:

```bash
npm run crm-sync:b2c:verify
```
> This command will verify that the credentials, clientId / clientSecret, code-version, and specified sites can all be verified against the host specified in the .env file.  Errors will be reported to the console.

4. Create the Salesforce ScratchOrg .env configuration properties.  Follow the guidance above, and specify the type of scratchOrg to generate.

> The 'base' scratchOrg profile supports Accounts and Contacts.  The 'personaccounts' scratchOrg profile supports PersonAccounts.  If any other value is provided, the 'base' profile will be defaulted.

5. Specify your default dev hub username by executing the following CLI command, this should be the username of the Environment Hub enabled Org that will host your scratchOrg ([Enable Dev Hub Features in Your Org](https://help.salesforce.com/articleView?id=sf.sfdx_setup_enable_devhub.htm&type=5))

```bash
sfdx config:set defaultdevhubusername=[devHubOrg-username]
```

6. Authenticate with your Environment Hub Org using:

```bash
sfdx auth:web:login
```

7. Generate the Salesforce metadata required by b2c-crm-sync, create a scratchOrg, and deploy the b2c-crm-sync Salesforce Platform code by executing the following CLI command:

```bash
npm run crm-sync:sf:build
```

> This CLI command automates the steps outlined above.  Automation results will be output through the CLI.  If successful, a browser tab will be opened to the created scratchOrg.

:round_pushpin: &nbsp; Please note that the next step should **only be performed if you created a scratchOrg supporting PersonAccounts**.  This step can be skipped if the [base scratchOrg profile](./config-dx/b2c-base-scratch-def.json) was used.

8. If you are deploying a personAccount scratchOrg, you'll also need to manually deploy the Salesforce Platform layout and quickAction elements for PersonAccounts.  The following SFDX command can be used to deploy these elements to your scratchOrg:

> :warning: &nbsp; As a reminder, the **personAccounts implementation is incomplete** at this time.  Please review the [issues list](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues) for details and known issues.  We'll update the ReadMe.md once personAccounts have been completely implemented. &nbsp; :warning:

```bash
sfdx force:source:deploy -p "src/sfdc/person-accounts"
```

> The deployment results will be output via the CLI.  Please note that these elements are a requirement for environments where personAccounts are enabled.


9. Use the below CLI command to retrieve configuration data needed for .env as outlined above.

```bash
sfdx force:org:display -u [scratchOrg-username]
```

> Copy the scratchOrg domain url and username to the .env file.  These values will be used to drive the creation of the B2C Commerce Service definitions that will enable integration with the Salesforce Platform.

10. Use the below CLI command to generate a password for the scratchOrg user that can be populated in .env as described above.

```bash
sfdx force:user:password:generate --targetusername [scratchOrg-username]
```

> Copy the generated user-password to the .env file.  This value will be used to drive the creation of the B2C Commerce Service definitions that will enable integration with the Salesforce Platform.

11. View the full detail of information about the scratchOrg user using the following CLI command:

```bash
sfdx force:user:display -u [insert-username]
```

> Copy the login-url domain to the .env file.  This value will be used to enable authentication to the scratchOrg from the B2C Commerce environment.

12.  In your scratchOrg, enter Setup and find the User avatar in the header (the avatar should look like Astro, and be displayed in the upper right corner of the browser.  Hovering over Astro will display the label "View Profile".

13.  Click on the User avatar and select the option titled **Settings**.  From the settings menu, click on the option titled **Reset Security Token** to generate a new token for your scratchOrg user.

> Please note that you will receive two emails declaring that a new securityToken has been generated.  The first is from the password reset that was performed.  The second is from this action.  Copy the securityToken from the second email to the .env file.

14.  Ensure that the following .env Salesforce Platform configuration properties have been captured via steps 8, 9, 10, and 11.

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=power-dream-1234-dev-ed.lightning.force.com
SF_LOGINURL=test.salesforce.com
SF_USERNAME=test-2enmvjmefudl@example.com
SF_PASSWORD=P@ssw0rd!
SF_SECURITYTOKEN=5aqzr1tpENbIpiWt1E9X2ruOV
```

> Remember that these values need to be driven by your scratchOrg user and environment.  These values must be accurate to ensure that the B2C Commerce meta-data is successfully generated and supports the integration with the Salesforce Platform.

15.  Test your Salesforce Platform Configuration properties by executing the following CLI Command:

```bash
npm run crm-sync:sf:auth:usercreds
```

> This command will attempt to authenticate against the Salesforce scratchOrg using the environment and credential information provided in the previous step.  The CLI command will either return an error -- or return the authToken that was generated by the Salesforce Platform in response to the authentication request.

:warning: &nbsp; Only proceed to the next step if you are able to successfully validate that your Salesforce Platform Configuration Properties are able to successfully authenticate against your scratchOrg. &nbsp; :warning:

15. Generate the B2C Commerce metadata required by b2c-crm-sync and deploy both the code metadata to the Salesforce B2C Commerce instance by executing the following CLI command:

```bash
npm run crm-sync:b2c:build
```
> This CLI command will generate the services.xml file based on the previously generated connected apps step #4, generate a zip archive containing the metadata required by b2c-crm-sync, deploy this archive, generate a zip archive containing the b2c-crm-sync cartridges and deploy this archive to the B2C Commerce instance.

### Salesforce Customer 360 Platform Configuration Instructions

#### Assign the B2C Integration Tools Permission Set to the Administrator
b2c-crm-sync leverages a permission-set to provide application access to a user.  You can use this permission-set to assign the application to other users -- and customize it to align with your security priorities.

1.  Enter Setup (if it is not already opened).

2.  In the quick-find, search for Permission Sets.  Once located, select the Permission Sets setup option from the filtered setup menu.

3.  Open the **B2C Integration Tools** permission-set.  From its detail page, select the button labeled "Manage Assignments".

4.  From the assignment listing, please select the button labeled 'Add Assignment'.

5.  Assign the **B2C Integration Tools** permission-set to the Scratch Org Administrator (typically a user with the first and lastName of 'User').

6.  Save your changes by clicking on the 'Assign' button.  Click on the 'Done' button to confirm your changes and exit the permission-set display.

#### Configure Duplicate Rules Leveraged by b2c-crm-sync
b2c-crm-sync leverages match and duplicate rules to enforce the B2C Customer Data Strategy it employs.  These rules are leveraged to alert administrators of potential duplicate B2C Commerce Customer Profiles -- and assist in resolving customer profiles using a sub-set of customer attributes.

1.  In the setup quick-find, search for Duplicate Rules.  Once located, select the Duplicate Rules setup option from the filtered setup menu.

2.  From the duplicate rules listing, select the rule titled **B2C Commerce: Standard Contacts**.  Edit the rule from the detail display.

> If you are leveraging our personAccounts implementation, you'll want to configure the **B2C Commerce: Standard PersonAccounts** duplicate rule instead of the **B2C Commerce: Standard Contacts** rule.
- Under the Conditions section near the bottom of the form display, click on the link labeled 'Add Filter Logic'.
- Paste the following filter logic value in the field -- and save your results.  Please note that this should be done for both PersonAccounts and Account / Contacts.

```bash
1 OR (2 AND 3) OR (2 AND 4 AND 5) OR (4 AND 5 AND 6)
```

> If you are leveraging our personAccounts implementation, please ensure that the **B2C Commerce: Standard Contacts** duplicate rule is disabled.  It does not need to be enabled in Salesforce orgs where personAccounts are enabled.

#### Find and Launch the B2C-CRM-Sync Lightning App

1. Open the appLauncher, and search for 'CRM' in the quick-find. Verify that the **B2C CRM Sync** application is visible.

2. Select the **B2C CRM Sync** application and open it.  Verify that the B2C Instances, B2C CustomerLists, B2C Sites, Accounts, and Contacts tabs are visible from within the application.

3. Click on the B2C Instances Tab, and from the record-listing page click the 'New' button to create a new B2C Instance.

4. Enter a name for your B2C instance (whatever you want), check Is Active, select the appropriate Instance Type.

5. Populate the API URL with the host name of your B2C Instance.

6. Select the drop-down arrow next to the 'Printable View' quick action  in the top right of the B2C Instance record detail view and select 'Configure Instance Integration'.

> This assigns a Named Credential to the B2C Instance.  This Named Credential will be used to access the B2C Commerce environment's REST APIs.

7. Select the named credential ending with 'B2C: Client Credentials' and click 'Next'.  Verify that the named credential was successfully associated with the B2C Instance record.

8. Select the drop-down arrow next to the 'Printable View' quick action  in the top right of the B2C Instance record detail view and select 'Seed CustomerLists and Sites'.

> This will retrieve the configured list of B2C CustomerLists and Sites from the B2C Instance.  These records will be seeded in the b2c-crm-sync application, and will drive integration with B2C Commerce.

9. Select the drop-down arrow next to the 'Printable View' quick action  in the top right of the B2C Instance record detail view and select 'Activate B2C CustomerLists'.

> All integration can be managed via the Active and Permission Flags on the B2C Commerce Instance, CustomerList, and Site records.  Use these settings to control which sites and CustomerLists support integration with B2C Commerce.

#### Validate Your Installation
You can validate your installation by executing the multi-cloud unit-tests that are included with this enablement solution.  Exercise the mutli-cloud unit-tests by executing the following CLI command:

```bash
npm run crm-sync:test:use-cases
```
> This CLI command will execute the multi-cloud unit tests designed to validate the Salesforce environment's duplicate management configuration, bi-directional customer profile synchronization between B2C Commerce and the Salesforce Platform, and progressive customer resolution scenarios.  These tests exercise integration from both B2C Commerce and the Salesforce Platform.

#### What's Next?
At this point, you should be in a position to 1) start exercising the integration or 2) [ask a question]() or [log an issue]() if the installation and configuration didn't complete as expected.  Please share your experience with us. :grin:

#### Let's End with Gratitude
I'd like to extend a heartfelt and personal thank you to everyone for their support, contributions, and guidance.  This has been a multi-year effort spanning multiple teams at Salesforce.  We've developed this data strategy and integration approach leveraging learnings from customers, partners, and our internal teams.  I am grateful for these relationships, and this project would not have come to life without the support of this group.

:raised_hands: &nbsp;&nbsp;Thank you.  For Everything.&nbsp;&nbsp; :raised_hands:
<br/>
<br/>

| | | |
|:--------------:|:--------------:|:--------------:|
| Derrick Ellis | Neeraj Yadev | Praveen Guar |
| Christa Matukaitis | Eric Schultz| Ahmed Saad |
| Olena Baykur | Qingyang Zhao | Kieran Lane |
| Christopher Lam | Jordane Bachelet | Roberto Manicardi |
| Raghuram Sripada | Gajendra Singh Sisodia | David Adler |
| Mike King | Mihir Panchal | Tasha Wilkins |
| Divya Alavarthi | Shoby Abdi | Phil Egan |
| Amanda Hatker | Alan Dray | Mehmet Orun |
| Jorge Hernandez | Tom Zarr | Lena Conforti |
| Allison Daly | Shoby Abdi | Paul Holstein |
| Kristyn Levine | Nia Samady | Don Lynch |


