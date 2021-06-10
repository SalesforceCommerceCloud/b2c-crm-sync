# Salesforce B2C Commerce / Customer 360 Platform Integration #

## Introduction ##

Salesforce B2C Commerce / CRM Sync is an enablement solution provided by the Salesforce Architect Success Team designed to teach Salesforce's B2C Customer Data Strategy for multi-cloud use-cases.  The solution demonstrates a contemporary approach to the integration between Salesforce B2C Commerce and the Salesforce Customer 360 Platform.  This project provides a framework for integrating these two clouds leveraging REST APIs -- and the declarative capabilities of the Salesforce Platform to power frictionless customer experiences across B2C Commerce, Service, and Marketing Clouds.

##### Now Supporting PersonAccounts AND Accounts / Contacts
We've just merged in our updates to support both PersonAccounts and Accounts / Contacts as customerModels within the Salesforce Platform.  Our overall **Apex unit-test coverage is at 85%**, and we've expanded our suite of [multi-cloud unit tests](test/_use-cases) to exercise almost fifty individual multi-cloud integration test-cases.

> :warning: &nbsp;This repository is currently in **beta** as we continue to harden our tests and the MVP feature-set.  Solution trustworthiness is critical for our success.  Please visit our [issues-list](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues) to see outstanding issues and features, and visit our [discussions](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/discussions) to ask questions. &nbsp;:warning:

![Introducing b2c-crm-sync](/docs/images/crm-sync.gif)

> That's correct.  If you have a B2C Commerce Sandbox and a [Salesforce Platform DevHub](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev) -- you can get this integration setup in 15 minutes.

## Application Overview ##

b2c-crm-sync enables the resolution, viewing, and management of Salesforce B2C Commerce Customer Profiles within the Salesforce Platform as either Accounts / Contacts or Person Accounts.  The project serves as foundation for customized integration between B2C Commerce and the Salesforce Platform.  It is designed to teach the data strategy used to synchronize B2C Customer Profiles -- and extended to support multi-cloud use-cases between B2C Commerce, Marketing Cloud, and the Salesforce Platform (ex. Service, Sales, Loyalty Cloud, etc).

> Please note that this integration is an 'above the API' integration achieved via REST services -- and is not a low-level platform integration.  Think of this repository as a guide for integrating B2C Commerce and the Salesforce Customer 360 Platform leveraging REST APIs, custom code, and a subset of its declarative features.

b2c-crm-sync project leverages Salesforce B2C Commerce Open Commerce REST APIs to interact with B2C Customer Profiles -- and a series of Salesforce Platform REST services to 'announce' when relevant custom profiles B2C Commerce have been created or modified. Through these announcements, the Salesforce Platform requests the identified data objects (ex. customers) via REST APIs -- and then ingests elements of those data objects to create Account / Contact or PersonAccount representations of B2C Commerce Customer Profiles.

### License
This project, its source code, and sample assets are all licensed under the [BSD 3-Clause](License.md) License.

Please remember that this project **should not be treated as Salesforce Product**.  It is an enablement solution designed to teach Salesforce's B2C Customer Data Strategy for B2C multi-cloud use-cases. Customers and partners implement this at-will with no expectation of roadmap, technical support, defect resolution, production-style SLAs.

> Roadmap, enhancements, and defect resolution will be driven by the Salesforce Architect Community.  You are invited to [log an issue](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues/new/choose) or [submit a pull-request](Contributing.md) to receive an Architect Success hoodie.

### Support
The Salesforce Architect Success Team maintains this repository, and it is contributed to by the Salesforce SCPPE and Service Delivery teams within the Customer Success Group (CSG) -- as well as the broader Salesforce Community. This repository isn’t supported by Salesforce Commerce Cloud or Salesforce Platform Technical Support.

> :confetti_ball: &nbsp; We are always seeking contributions from our community of Architects and developers.  If you're curious to learn more about how you can [get an Architect Success Hoody](Contributing.md) -- please review our [contribution guidelines](Contributing.md).

For feature requests or bugs, please [open a GitHub issue](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues/new/choose). Contributions are ALWAYS WELCOME -- and are often rewarded with Architect Success swag.

![Come Get Your Architect Success Hoody](/docs/images/hoody-worthy.gif)

> Please keep in mind that [hoody-worthy](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues?q=is%3Aopen+is%3Aissue+label%3Ahoody-worthy) issues need to solve real business or project problems.  That said -- contribute, let us support you, and collect your swag. It's really that simple.  Visit our [contribution guidelines](Contributing.md) for details.

### Feature Summary

b2c-crm-sync supports the following high-level features:

- Configuration of multiple B2C Commerce environments (either Sandboxes or Primary Instance Group environments) within the Salesforce Customer 360 Platform
- Configuration of multiple B2C Commerce CustomerLists and Sites within the Salesforce Customer 360 Platform
- Secure and password-less integration between B2C Commerce and the Salesforce Platform via JWT (Java Web Tokens or 'jots')
- Granular integration control managing which instances, customerLists, and sites can interact with B2C Commerce and receive integration messages
- Supports both PersonAccounts and Account / Contact customer models within the Salesforce Customer 360 Platform
- Synchronization of registered Salesforce B2C Commerce customer profiles between the Salesforce Customer 360 Platform and Salesforce B2C Commerce
- Federated Access to the B2C Commerce Customer Address Books of Registered B2C Commerce Customers (Accounts and Contacts only)
- Order on Behalf of style Assisted Shopping for Customer Service Representatives configured and launched from within the Salesforce Platform

> We leverage [Salesforce SFDX for Deployment](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev), [Flow for Automation](https://trailhead.salesforce.com/en/content/learn/modules/flow-builder), [Platform Events for Messaging](https://trailhead.salesforce.com/en/content/learn/modules/platform_events_basics), Account Manager as an Auth Provider, [Salesforce Connect for Data Federation](https://trailhead.salesforce.com/en/content/learn/projects/quickstart-lightning-connect), and [Apex Invocable Actions](https://trailhead.salesforce.com/en/content/learn/projects/quick-start-explore-the-automation-comps-sample-app) to support these features.

### Setup Guidance

#### Deployment Considerations
This repository should be considered a developer framework that can be extended by customers and partners to support their specific implementation needs.  Implementing this solution will require configuration, customization, runtime-performance evaluation, and testing.  That said, it should also accelerate your implementation by providing you with a foundation you can build on.

> Do NOT deploy this enablement solution directly to a staging or production environment without first going through your development, QA, or CI process.  Remember that this solution is not supported by Salesforce Technical Support.

#### Environment Requirements
b2c-crm-sync requires a [B2C Commerce Sandbox](https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox) and a [Salesforce DevHub](https://help.salesforce.com/articleView?id=sf.sfdx_setup_enable_devhub.htm&type=5) capable of creating [scratchOrgs](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx).  It can also be deployed to [Salesforce Sandboxes](https://help.salesforce.com/articleView?id=sf.data_sandbox_create.htm&type=5)  leveraging [SFDX and Salesforce's metadata API](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_develop_any_org.htm).

> b2c-crm-sync can be deployed to a B2C Commerce Sandbox and Salesforce scratchOrg in 15 minutes following the instructions outlined in this ReadMe.  Please [set up your Salesforce DevHub](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_devhub.htm) and [SFDX](https://developer.salesforce.com/tools/sfdxcli) before moving forward with the installation process.

#### Node.js Setup Instructions

b2c-crm-sync leverages [node.js enabled CLI](https://github.com/tj/commander.js/) and [SFDX (Salesforce CLI)](https://developer.salesforce.com/tools/sfdxcli) commands.  You'll want to ensure that you have [node v15.2.1](https://nodejs.org/en/blog/release/v15.2.1/) running.  If you're new to node, we recommend setting up [nvm](https://github.com/nvm-sh/nvm) to manage multiple node versions.

> Use these articles to set up [nvm](https://github.com/nvm-sh/nvm) on your local workstation.  It's worth the effort to set this up, as it introduces great flexibility if you have projects that are dependent on specific node versions.

- You can [install nvm on the mac](https://jamesauble.medium.com/install-nvm-on-mac-with-brew-adb921fb92cc) using [brew](https://jamesauble.medium.com/install-nvm-on-mac-with-brew-adb921fb92cc).

- You can also [install nvm on windows](https://dev.to/skaytech/how-to-install-node-version-manager-nvm-for-windows-10-4nbi).

Once you have node installed, you can verify your local node version with the following command:

```bash
node --version
```

> This should return the version number of your active node.js version.  This command will return **v15.2.1** if node.js has been set up correctly.

With node.js setup, you can now install the project dependencies with the standard npm install command:

```bash
npm install
```
> Installing the project dependencies will take a moment or two.  Please [log an issue](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues/new) if you run into installation issues setting up the project.

Once the installation has been completed, you can apply non-breaking updates to node packages that are leveraged by b2c-crm-sync:

```bash
npm audit fix
```

> Please remember that forcing breaking changes with the `--force` option can also break the b2c-crm-sync install process.  This isn't recommended.

#### Install SFDX for SFDC Deployments
b2c-crm-sync also requires [SFDX](https://developer.salesforce.com/tools/sfdxcli) -- as it is used to create scratchOrgs and deploy the meta-data that powers it.  You can [verify your SFDX installation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) with the following command:

```bash
sfdx --version
```

#### B2C Commerce Setup Instructions

##### Setup the Demo B2C Commerce Storefronts

b2c-crm-sync is designed to work with existing B2C Commerce storefronts.  In the event that you do not have a storefront, you can use the existing leverage [Salesforce's Storefront Reference Architecture](https://trailhead.salesforce.com/content/learn/modules/cc-digital-for-developers) storefronts provided by Salesforce.  The RefArch and RefArchGlobal storefronts can be installed in any B2C Commerce sandbox using these instructions.

> If you have a B2C Commerce Sandbox, you can install the latest SFRA Build from the Administration Menu.  This **will not impact any other sites** that may already exist in your sandbox environment.

1. Open the Business Manager Administration Menu.
2. Under Site Development, select the `Site Import / Export` menu option.
3. In the import section, select `Storefront Reference Architecture Demo Sites` and click the `Import` Button to continue.
4. Select which SFRA build you'd like to leverage, scroll down to the bottom of the page and click the `Deploy` Button to install the site.

> If you are new to B2C Commerce, please use the default SFRA build to deploy in your sandbox.  The deployment and setup process takes about 10 minutes, and your sandbox environment will notify you via email when the deployment is complete.

##### Setup the RefArchGlobal Site to Use Its Own CustomerList

b2c-crm-sync supports [multiple sites and customerLists](https://documentation.b2c.commercecloud.salesforce.com/DOC2/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fcustomers%2Fb2c_customer_lists.html).  To see this in action, please ensure that the RefArchGlobal site leverages its own CustomerList.  SFRA ships with multiple customerLists -- but with its default setup, the RefArch customerList is associated to both the RefArch and RefArchGlobal sites.

> b2c-crm-sync's integration tests require that the SFRA RefArchGlobal storefront map to the RefArchGlobal CustomerList. This association can be made by editing the CustomerList association on the RefArchGlobal site.

1. Open the Business Manager Administration Menu.
2. Select the`Manage Sites` option under the Sites menu.
3. Select the `RefArchGlobal` site from the list of available sites by clicking on the siteId.
4. Update the CustomerList association by changing the select value to **RefArchGlobal**.
5. Click `Save` to save your changes.

Please note that this isn't a requirement -- but if you want a 100% pass-rate on our multi-cloud unit tests, you should make this change.  A number of our unit-tests exercise the RefArch and RefArchGlobal customer lists to test our customer resolution business rules.

>  A subset of the Multi-cloud unit tests will fail if your RefArch and RefArchGlobal sites leverage the same customerLists vs. having their own.  If you experience test failures, please review the test description for references to multiple customerLists.

##### Enable the Agent Permissions on the Administrator Role

The Order on Behalf Of (Assisted Shopping) use-case requires that Business Manager users representing Customer Service Agents have B2C Commerce permissions to login and place orders on behalf of registered storefront shoppers.  The Administrator role can be extended to include these permissions.

> In a production environment, a separate role should be created for Agents that provides the minimally required functional permissions.  Do not provide Agents with access to an over-permissioned Administrator role. 

1. Open the Business Manager Administration Menu.
2. Select the `Roles and Permissions` option from the Organization menu.
3. Select the `Administrator` role.
4. Select the `Functional Permissions` tab within the Administrator role properties.
5. Select the `RefArch` and `RefArchGlobal` sites from the Context modal.  This will set the context for permission changes applied to the Administrator role.
6. Click the `Apply` button to view the functional permissions for these sites.
7. Add the following functional permissions to the Administrator role by clicking each permission's checkbox:
    - Login_On_Behalf
    - Login_Agent
    - Adjust_Item_Price
    - Adjust_Shipping_Price
    - Adjust_Order_Price
    - Create_Order_On_Behalf_Of
    - Search_Orders 
    - Handle_External_Orders
    
> The Order on Behalf Of experience minimally requires the `Login_On_Behalf`, `Login_Agent`, and `Create_Order_On_Behalf_Of` functional permissions.  The other permissions can be included to extend the Agent capabilities. 

8. Click `Update` to apply these functional permissions to the Administrator role.

##### Create Your B2C Commerce Client ID

Before setting up the b2c-crm-sync environment, you have to create a B2C Commerce Client ID. This has to be done through the Account Manager Portal. Please follow these steps in order to create the client ID used in the environment bellow:

1. Go to [https://account.demandware.com](https://account.demandware.com)
2. Go to the `API Client` menu
3. Click on the `Add API Client` button at the top right of the page
4. Enter a display name and a password. The password corresponds to the `B2C_CLIENTSECRET` environment variable that you'll set up in the next section.
5. Within the OpenID Connect section, please ensure to configure at least the following:
    - Default Scopes: `mail`
    - Allowed Scopes: `mail`, `roles`, `tenantFilter`, and `profile` (on separate lines)
    - Token Endpoint Auth Method: `client_secret_post`
    - Access Token Format: `UUID`
6. Click the `Save` button to apply these changes to your ClientID's configuration.

Re-open the ClientID page -- and keep it open until the last section of the setup.  You'll have to add the callback URL of the Salesforce Core Auth Provider to the Redirect URIs field of your newly created client ID.

> Remember to also capture the password applied to the ClientID.  You will need to add the password to the .env file via the `B2C_CLIENTSECRET` property.

##### Setup a .env File
To begin, we use the [dotenv](https://medium.com/@thejasonfile/using-dotenv-package-to-create-environment-variables-33da4ac4ea8f) node.js library to store environment-specific configuration settings used to authenticate against a given B2C Commerce environment.  Before installing any of the project package dependencies, please follow these instructions to build-out a .env file that contains your environment's configuration settings.

- Rename the example file 'sample.env' to '.env' in the root of the repository.

> This file shouldn't be checked into the repository, and is automatically being ignored by Git

- Open the .env file and edit the following information.  Please update these values to reflect your sandbox environment's configuration properties.

```
######################################################################
## B2C Commerce Configuration Properties
######################################################################
B2C_HOSTNAME=b2csandbox.sandbox.us01.dx.commercecloud.salesforce.com
B2C_INSTANCENAME=b2csandbox
B2C_CLIENTID=[-------insert your clientId here---------------]
B2C_CLIENTSECRET=[-------insert your clientSecret here---------------]
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
|  B2C_CLIENTID |x| Represents the B2C Commerce Account Manager ClientID used to authenticate against the identified B2C Commerce environment. See the following [Create Your B2C Commerce Client ID](#create-your-b2c-commerce-client-id) chapter for additional information.|
|  B2C_CLIENTSECRET |x| Represents the B2C Commerce Account Manager password that corresponds to the identified ClientID|
|  B2C_SITEIDS |x| Represents a comma-delimited list of sites to deploy b2c-crm-sync to |
|  B2C_CODEVERSION |x| Represents the B2C Commerce code version to which the b2c-crm-sync's plugin cartridges will be deployed.  See [Manage Code Versions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_managing_code_versions.html#) for additional information.|
|  B2C_DATARELEASE |x| Represents the B2C Commerce data release to be deployed to the specified B2C Commerce environment|
|  B2C_USERNAME |x| Represents the Account Manager username with permissions to access the B2C Commerce environment identified in the hostname |
|  B2C_ACCESSKEY  |x| Represents the B2C Commerce web access key that can be used to authenticate against the specified B2C Commerce environment.  See [Create an Access Key for Logins](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_access_keys_for_business_manager.html#) for additional information.  Choose the scope 'Agent User Login and OCAPI' to generate the Access Key used for B2C Commerce deployments.|
|  B2C_CERTIFICATEPATH | | Represents the path to the certificate to use during the two-factor authentication against the B2C Commerce environment Please note this should be used for Staging Environments only: See [Configure Secure Code Uploads](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_secure_code_uploads.html#) for more information.|
|  B2C_CERTIFICATEPASSPHRASE | | Represents the passphrase of the certificate to use during the two-factor authentication against the B2C Commerce environment. Please note this should be used for Staging Environments only: See [Configure Secure Code Uploads](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_secure_code_uploads.html#) for more information.|

The CLI build tools present within this solution will use this information to remotely authenticate against your environment via B2C Commerce REST APIs prior to attempting any import, upload, or re-index activity.  They are also used to automate the creation of Salesforce Platform meta-data describing the B2C Commerce environment and Named Credentials used to access the B2C Commerce instance.

> Prior to saving your file, please verify that the url is correct, and that the clientId / clientSecret are accurate.  The instance name should represent a shorthand nickname for the B2C Commerce environment.  This information must be accurate in order for these activities to successfully process the site-import.

#### Configure Your B2C Commerce OCAPI Permissions
The build scripts in this repository leverage B2C Commerce's [sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci) automation library.  This library performs a number of continuous-integration related activities that enable the site-data uploading and import.  Before we can leverage the automation tasks, the Salesforce B2C Commerce environment's OCAPI Data API permissions must be enabled to support remote interactions.

> Yes, we will be porting this to leverage the new B2C Commerce APIs in a future release.  For now, all use-cases can be satisfied via OCAPI.

##### Configure Your Shop API Permissions

> We leverage the Shop API to facilitate enable Headless use-cases, multi-cloud unit tests that can be executed via the CLI, and to support Assisted Shopping (OOBO) via the B2C Commerce storefront.

- Log into the Business Manager.
- Navigate to Administration > Site Development > Open Commerce API Settings.
- Select 'Shop API' and 'Global' from the available select boxes.
- Add the following permission set for your clientId to the existing configuration settings.  Map your allowed-origins to point to your Salesforce environment (you may have to come back and set this after your scratchOrg is created below).
- Always remember to save your changes and confirm that they've been written to your Business Manager environment.

> In your configuration, please remember to nest these configuration settings inside the clients array.

```json
{
  "_v": "21.3",
  "clients": [
    "insert your updated configuration here" 
  ]
}
```

> Map the OCAPI REST API configuration settings displayed below to the client_id that will be used to facilitate this integration.

> Remember to paste this configuration within the clients array -- as explained above.

```json
{
  "client_id":"[-------insert your clientId here---------------]",
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

> We leverage the Data API to facilitate server-to-server updates from the Salesforce Platform to B2C Commerce.  When a user modifies a customer profile in the Salesforce Platform, the platform publishes those updates to B2C Commerce via the B2C Commerce DATA API.

- Select 'Data API' and 'Global' from the available select boxes.
- Add the following permission set for your clientId to the existing configuration settings.  Map your allowed-origins to point to your Salesforce environment (you may have to come back and set this after your scratchOrg is created below).
- Always remember to save your changes and confirm that they've been written to your Business Manager environment.
- If your existing settings are empty, first add the base 'clients' element referenced above

> In your configuration, please remember to nest these configuration settings inside the clients array.

```json
{
  "_v": "21.3",
  "clients": [
    "insert your updated configuration here" 
  ]
}
```

> Map the OCAPI REST API configuration settings displayed below to the client_id that will be used to facilitate this integration.

> Remember to paste this configuration within the clients array -- as explained above.

```json
{
  "client_id":"[-------insert your clientId here---------------]",
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
      "client_id":"[-------insert your clientId here---------------]",
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

> Please use [Trailhead's Quick Start: Salesforce DX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx) as a guide to set up a DevHub that can generate Salesforce scratchOrgs.

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

You will leverage the .env file's configuration properties to dramatically simplify the build and deployment of b2c-crm-sync.  Check the package.json for the complete set of CLI commands that can be used to automate meta-data generation, service definition creation, and validate environment configurations prior to deployment.

### Deployment Instructions
The b2c-crm-sync repository includes a collection of CLI commands that can be used to prepare and deploy the b2c-crm-sync assets to B2C Commerce and a Salesforce Customer 360 Platform scratchOrg.  

The CLI commands leverage the [.env file](sample.env) configuration to retrieve runtime execution values.  They also include support for command-line argument equivalents of the .env configuration values.  Each command has an associated [api method](lib/cli-api) that can be leveraged from within custom deployment scripts.

> Before running any commands below be sure to run `npm install` from the root of the b2c-crm-sync repository folder.  These commands are dependent on the project successfully being installed in your workspace.  You can inspect the complete collection of commands via the [package.json](package.json)'s scripts section.

### Deployment and Configuration Pre-requisite Checklist

By this point, you should have completed the following configuration activities:

- [x] Installed node.js and sfdx in your local workspace.

- [x] Setup the B2C Commerce storefront(s) that will be used to exercise b2c-crm-sync.  If you do not have a storefront, you can use the demo SFRA storefronts available in any B2C Commerce sandbox.

- [x] Configured the initial collection B2C Commerce OCAPI and WebDAV permissions.  The `allowed_origins` properties can be set after a Salesforce ScratchOrg has been created.

- [x] Setup the Agent permissions on the Administrator role.  This is a requirement if you'd like to exercise the Order on Behalf of use-case.

- [x] Created the B2C Commerce .env configuration properties.

- [x] Installed b2c-crm-sync to your local workspace.

If these items have been completed, you should now be ready to move forward with the deployment and configuration of b2c-crm-sync.

> Please ensure that you have completed all of these activities prior to moving forward.  Each of the checklist-item activities must be successfully completed to deploy and configure b2c-crm-sync. Moving forward without completing these activities will result in deployment failures. 

#### Exercise the CLI and B2C Commerce Unit Tests

1. Execute the CLI unit-tests to verify that the CLI install, setup, and configuration is working as expected.

```bash
npm run crm-sync:test:cli
```

> Please note that not all CLI commands have test-coverage (most of the B2C commands do, only some SFDC commands do).  That said, you shouldn't expect to see any test failures.  We're always looking for more tests -- if you're interested in an Architect Success Hoody.

2. Execute the B2C Commerce unit-tests to verify that the B2C Commerce cartridge and OCAPI Hook code is trustworthy.

```bash
npm run crm-sync:test:b2c
```

> Like with the CLI tests, you shouldn't expect to see any failures when exercising the B2C unit-tests.

#### Validate Your .env B2C Commerce Sandbox Credentials

3. Verify that your .env B2C Commerce configuration properties are accurate by executing the following CLI command:

```bash
npm run crm-sync:b2c:verify
```
> This command will verify that the credentials, clientId / clientSecret, code-version, and specified sites can all be verified against the host specified in the .env file.  Errors will be reported to the console.

Please note that the code-version specified in the .env file must be valid in order for the verify command to complete successfully.  The code version must be accurate to deploy the B2C Commerce SFRA cartridges that are leveraged by b2c-crm-sync.

4. Create the Salesforce ScratchOrg .env configuration properties.  Follow the guidance above, and specify the type of scratchOrg to generate.

> The 'base' scratchOrg profile supports Accounts and Contacts.  The 'personaccounts' scratchOrg profile supports PersonAccounts.  The 'base' profile will be defaulted if an unrecognized value exists.

#### List the Available Salesforce Orgs

5. List your supported Salesforce DevHubs, scratchOrgs, and their connected status.  You can use this command to verify that your DevHub is available.

```bash
sfdx force:org:list --all
```
> Please refer to [Salesforce DX Usernames and Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm), the [SFDX Org command-set](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_org.htm), and the [Salesforce Platform DevHub Trail](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev) for resources on how to manage scratchOrgs.

#### Specify Your Default DevHub UserName

6. Specify your default DevHub username by executing the following CLI command.  The devHubOrg-username represents the DevHub that will host your scratchOrg.  Please see [Enable Dev Hub Features in Your Org](https://help.salesforce.com/articleView?id=sf.sfdx_setup_enable_devhub.htm&type=5) for details on how to set up a DevHub environment.

```bash
sfdx config:set defaultdevhubusername=[devHubOrg-username]
```

> If you experience the error **ERROR running config:set: No AuthInfo found for name [dev hub username]**, please authenticate against the selected DevHub using the [web:login SFDX command](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_auth_web.htm).

Authenticate against your Salesforce DevHub by executing the following CLI command:

```bash
sfdx auth:web:login
```

The [web:login command](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_auth_web.htm) supports multiple arguments to enable authentication against registered orgs (via the `-d -a [DebHub]` alias) or authenticate against new orgs (via the `-r [login-url]` option).

> Once executed, this command should open the Salesforce org in your browser and allow you to authenticate against the specified org with valid credentials.  You should only need to execute this command when connecting to a new DevHub, and you can use the `sfdx config:set defaultdevhubusername=[devHubOrg-username]` to make this specific org your default DevHub.

After you have successfully authenticated against your DevHub, you can move forward with generating a new ScratchOrg.

#### Create a ScratchOrg and Deploy b2c-crm-sync

7. Generate the Salesforce metadata required by b2c-crm-sync, create a scratchOrg, and deploy the b2c-crm-sync Salesforce Platform code by executing the following CLI command:

```bash
npm run crm-sync:sf:build
```
> This CLI command automates the steps outlined above.  Automation results will be output through the CLI.  If successful, a browser tab will be opened to the created scratchOrg.

#### Reset the SecurityToken for Your ScratchOrg User

8. In your scratchOrg, enter Setup and find the User avatar in the header (the avatar should look like Astro, and be displayed in the upper right corner of the browser).  Hovering over Astro will display the label "View Profile".

- Click on the User avatar and select the option titled **Settings**.
- From the settings menu, click on the option titled `Reset Security Token` to generate a new token for your scratchOrg user.

> Don't forget to [reset the securityToken](https://help.salesforce.com/articleView?id=sf.user_security_token.htm&type=5) for your scratchOrg user.  This has to be done manually and is not included with the output generated by the `npm run crm-sync:sf:user:details` command.

- Once your token has been reset, check your email for the reset notification from your Salesforce scratchOrg.
- Copy the securityToken from the email to the `SF_SECURITYTOKEN` property of your .env file.

#### Setup the .env Salesforce ScratchOrg Authentication Credentials

9. B2C Commerce service definitions pointing to the deployed scratchOrg can be seeded with Salesforce environment authentication credentials.  Please execute the following npm command to output a copyable representation of these values:

```bash
npm run crm-sync:sf:user:details
```
> This command will output the hostName, loginUrl, userName, and Password for your scratchOrg user.  You can copy this to the clipboard and paste it in your .env file.

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=power-dream-1234-dev-ed.lightning.force.com
SF_LOGINURL=test.salesforce.com
SF_USERNAME=test-2enmvjmefudl@example.com
SF_PASSWORD=P@ssw0rd!
```
> The following table describes each of the Salesforce Customer 360 Platform's .env file variables that are leveraged by b2c-crm-sync's build and deployment tools to automate the creation of service definitions.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_HOSTNAME |x| Describes the url for the scratchOrg being integrated with a B2C Commerce instance.|
|  SF_LOGINURL |x| Describes the login url used to authenticate against the scratchOrg specified (generally test.salesforce.com)|
|  SF_USERNAME |x| Represents the username of the scratchOrg user|
|  SF_PASSWORD |x| Represents the password of the scratchOrg user.  See [Generate or Change a Password for a Scratch Org User](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_passwd.htm) for additional information. |
|  SF_SECURITYTOKEN |x| Represents the securityToken of the scratchOrg user. You can create or reset the security token from your scratchOrg User Settings under 'Reset My Security Token.'|

The build tools will use this information to create the B2C Commerce service definitions facilitating the integration with the Salesforce scratchOrg.  

#### Update the .env File With Your Salesforce ScratchOrg Credentials

10.  Copy the .env Salesforce Platform Configuration Properties to your .env file -- and save it.  You may need to scroll-up before the success message display to find this section of the output display in the console.

:warning:&nbsp; Remember that these values need to be driven by your scratchOrg user and environment.  These values must be accurate to ensure that the B2C Commerce meta-data is successfully generated and supports the integration with the Salesforce Platform. &nbsp;:warning:

> Do not proceed with the next step until your securityToken has been reset and copied to your .env file.  Your authentication attempts **will fail** if you authenticate without leveraging the reset securityToken.

#### Validate Your .env Salesforce ScratchOrg Credentials

11.  Test your Salesforce Platform Configuration properties by executing the following CLI Command:

```bash
npm run crm-sync:sf:auth:usercreds
```

> This command will attempt to authenticate against the Salesforce scratchOrg using the environment and credential information provided in the previous step.  The CLI command will either return an error -- or return the authToken that was generated by the Salesforce Platform in response to the authentication request.

:warning: &nbsp; Only proceed to the next steps if you are able to successfully validate that your Salesforce Platform Configuration Properties are able to successfully authenticate against your scratchOrg. &nbsp; :warning:

#### Generate and Download a Self-Signed Certificate 

12. Now that your scratchOrg user credentials have been validated, you can generate a self-signed certificate via the Salesforce Org and download it as a KeyStore.  You'll use the cert to mint JWT AuthToken requests presented to the B2C Commerce Account Manager.

- Enter Setup within your scratchOrg and in the quick-find, search for `cert`.
- Select the `Certificate and Key Management` option found under the Security menu.
- Click on the button titled `Create Self-Signed Certificate`.
- Use this table to inform the field values used to create your new self-signed cert.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  Label |x| Set to your .env file's `B2C_INSTANCENAME` value.  This will be used to identify the cert within the platform. |
|  Unique Name |x| Set to your .env file's `B2C_INSTANCENAME` This will be used to identify the cert within the platform. |
|  Exportable Private Key |x| Check this checkbox; the privateKey should be exportable. |
|  Key Size |x| Change from 2048 to **4096**. |

- Click the `Save` button to create your new self-signed certificate.

> This certificate will be used by B2C Commerce's Account Manager to authenticate REST API requests made by the Salesforce Org.  Saving the certificate definition should return you to its detail page.

- In Setup menu, click on the `Certificate and Key Management` option found under the Security menu to return to the main certificate listing.
- From the **Certificate and Key Management** display, click the button labeled `Export to KeyStore`.
- Provide a password that will be used to secure the keystore.

> Please make note of this password, as it can be used to export the public and private keys from the keystore.  Record this password in a safe and secure space.

- Click the `Export` button to download the keystore.
- Copy the keystore to the _jwt/sfdc directory.

We will use the keystore to extract the public and private keys -- and leverage these keys to exercise JWT validation between B2C Commerce's Account Manager and the Salesforce Org.

#### Extract the Public Key from the KeyStore

13. Execute the following CLI command to extract the publicKey from the KeyStore and output it via the console.  We'll use the public key to update your Account Manager ClientID configuration so that you can securely get AuthTokens from Account Manager without requiring a ClientSecret for authentication.

```bash
npm run crm-sync:sf:cert:publickey:get
```
When prompted, please enter the password you used to create the keyStore that was downloaded to the _jwt/sfdc directory.

> This command will parse the public key from your certificate and output its contents to the console.  It expects that your cert is in the `_jwt/sfdc` directory and will throw an error if no cert exists in this directory.

Completing this command successfully should output to the console two key pieces of information about the certificate 

- The Salesforce certificate's developerName; this is the internal / unique name applied to the certificate when created
- The Salesforce certificate's base64 content; this is the component of the keyStore that will be used by Account Manager to verify the authenticity of b2c-crm-sync authToken requests

We need the certificate developerName to default certificate associations across your B2C Instance's CustomerLists and Sites.  Please copy the developerName value 
to your .env file via the `SF_CERTDEVELOPERNAME` value.  For your convenience, the CLI command will output an updated representation of your **Salesforce Platform Configuration Properties**.

```bash
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=power-dream-1234-dev-ed.lightning.force.com
SF_LOGINURL=test.salesforce.com
SF_USERNAME=test-2enmvjmefudl@example.com
SF_PASSWORD=P@ssw0rd!
SF_SECURITYTOKEN=5aqzr1tpENbIpiWt1E9X2ruOV
SF_CERTDEVELOPERNAME=powerdream1234
```
The Salesforce Platform Configuration Properties now include the `SF_CERTDEVELOPERNAME` property.  This key / value pair must be copied to your .env file.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_CERTDEVELOPERNAME |x| Represents the developerName of the self-signed certificate used by the Salesforce Platform to mint JWT tokens and by the B2C Commerce Account Manager to validate JWT tokens.|

> The certDeveloperName will be used to broker REST API authorization between the Salesforce Platform and B2C Commerce -- enabling the Salesforce Platform to leverage B2C Commerce REST APIs.  The certificate will be written to the `_jwt/sfdc` directory using the certificate developerName as the filename.  You can access this file if you need to reference the certificate in the future.

#### Setup the JWT Certificate and AuthToken Format in Account Manager

14. Now that you have extracted the Salesforce self-signed Certificate from the downloaded JavaKeyStore, please copy the certificate definition to your clipboard.  Copy everything in-between and including the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` tags -- and log into Account Manager to update your Client ID.

> A copy of the certificate should exist in your `_jwt/sfdc` directory.  If you do not have one, please re-run the `crm-sync:sf:cert:publickey:get` command -- as this will re-generate the .cert file for you.

- Toggle to the Account Manager ClientID page opened in the step **Create Your B2C Commerce Client ID**.
- Locate the `Client JWT Bearer Public Key` form field under the **JWT** heading.
- Paste the copied certificate contents into the `Client JWT Bearer Public Key` field.  Remove any trailing spaces or line-feeds that are copied following the `-----END CERTIFICATE-----` marker.  The pasted certificate contents should not have any leading or trailing whitespace. 
- Locate the `Token Endpoint Auth Method` form field near the bottom of the form.  Change this value to `private_key_jwt`.
- Click `Save` to apply the callbackUrl to the ClientID definition.

> These updates to your ClientID will change the authentication method from being ClientID / ClientSecret driven to ClientID and Certificate driven, as the JWT approach to authentication eliminates the need for passwords.  The non-password authentication approach makes it a preferred, trustworthy, and lower risk authentication method.

#### Validate that You Can Retrieve an Account Manager AuthToken Leverage JWT

15. Now that the .env file has been configured to include the Salesforce self-signed certificate developerName -- we test retrieving a B2C Commerce REST API AuthToken from Account Manager leveraging the JWT authentication approach.  Please execute the following CLI command:

```bash
npm run crm-sync:b2c:auth:jwt
```
> This command is dependent on the correct JWT-specific configuration of the B2C ClientID via Account Manager, access to the public / private keys belonging to the Salesforce self-signed certificate keyStore, and the configuration of the certificate developerName.  Please ensure that these three configuration elements have been successfully completed before continuing.

If successful, the CLI output should render the authToken provided by the B2C Commerce Account Manager -- in response to successful authentication leveraging JWT.  Any errors will be output to the console -- along with the request properties that were used to mint the JWT.

#### Create your Order on Behalf of Authentication Credentials

The Order on Behalf Of shopping experience requires that Service Agents in the Salesforce Platform authenticate against the B2C Commerce environment prior to creating the shopping session.  This authentication is managed by a Per-User Named Credential via the Salesforce Platform.

16.  Create the per-user Named Credential in the Salesforce Platform that will be used by the ScratchOrg user to act as an Agent and create virtual shopping sessions.

- From the ScratchOrg, click on the Astro icon in the upper right-hand corner of the Salesforce org.
- Select the option titled `Settings` under the User Display.
- In the `My Personal Information` Menu, select the option titled 'Authentication Settings for External Systems'.
- Select the `New` button to creat a new set of authentication credentials.

> The **Authentication Settings for External Systems** form captures the credentials that can be used by agents to authenticate against other systems.  Use this form to configure the B2C Commerce credentials the agent will use to authenticate against B2C Commerce.

- Map the per-user Named Credential to your scratchOrg user by clicking on the magnifying glass-icon to the right of the `User` field.  Select your user from the list of Recently Viewed users.
- Use the table below to complete the remaining fields of the per-user Named Credential form.

| Property Name | Required | Expected Value                       |
|--------------:|:----:|:-----------------------------------|
|  External System Definition |x| Named Credential |
|  Named Credential |x| [b2cInstanceName]: B2C: OOBO: Named Credential |
|  Authentication Protocol |x| Password Authentication |
|  Username |x| Your B2C Commerce environment username |
|  Password |x| Your B2C Commerce AccessKey + ':' + B2C Commerce ClientSecret |

> The **username** property should use your .env file's `B2C_USERNAME` value.  The **password** property should use your .env file's `B2C_ACCESSKEY` and `B2C_CLIENTSECRET` values -- separated by a `:`.  It should look something similar to `1nY%|GvAnu]}tvNNe[~7zkn12]ZLU)lV~CbXzO{w:yourclientsecretpassword`.

- When all form fields have been completed, please click the `Save` button save this per-user Named Credential definition.  Confirm that the per-user Named Credential has been created within your Personal Settings.

#### Configure Duplicate Rules Leveraged by b2c-crm-sync

b2c-crm-sync leverages match and duplicate rules to enforce the B2C Customer Data Strategy it employs.  These rules are leveraged to alert administrators of potential duplicate B2C Commerce Customer Profiles -- and assist in resolving customer profiles using a sub-set of customer attributes.

17. In the setup quick-find, search for Duplicate Rules (searching for 'dup' should bring up Duplicate and Match Rules).  Once located, select the Match Rules setup option from the filtered setup menu.

##### Account / Contact Match Rules Setup Guidance

> If you are setting up PersonAccounts, please skip this section and proceed to the section titled [PersonAccount Match Rules Setup Guidance](#personaccount-match-rules-setup-guidance).

- Ensure that the **B2C Commerce: Standard Contacts** Match rule is activated.  This rule must be active in the scratchOrg as part of the Accounts / Contacts implementation.  The corresponding duplicate rule is dependent on this Match Rule being activated.

##### Account / Contact Duplicate Rules Setup Guidance

From the duplicate rules listing, select the rule titled **B2C Commerce: Standard Contacts**.  Edit the rule from the detail display.

- Activate the Duplicate Rule by checking the activation checkbox.
- Under the Conditions section near the bottom of the form display, click on the link labeled 'Add Filter Logic'.
- Paste the following filter logic value in the field -- and save your results.

```bash
1 OR (2 AND 3) OR (2 AND 4 AND 5) OR (2 AND 4) OR (4 AND 5 AND 6)
```
##### PersonAccount Match Rules Setup Guidance

- Ensure that the **B2C Commerce Standard Person Account** match rule is activated.  This rule must be active in the scratchOrg as part of the PersonAccounts implementation.  The corresponding Duplicate Rule is dependent on this Match Rule being activated.

- Ensure that the **B2C Commerce: Standard Contacts** match rule is deactivated.  This rule must be not activated as part of the PersonAccounts implementation.

> The B2C Commerce: Standard Contacts should automatically be deactivated as part of the PersonAccounts meta-data deployment.

##### PersonAccount Duplicate Rules Setup Guidance

Leveraging the PersonAccount implementation requires a handful of additional configuration steps to disable the Contact match and duplicate rules -- and enable the related PersonAccount rules.

> The PersonAccount match and duplicate rules are disabled by default -- and must be activated manually through the Setup options of your Salesforce Org.

From the duplicate rules listing, select the rule titled **B2C Commerce: Standard Person Accounts**.  Edit the rule from the detail display.

- Activate the Duplicate Rule by checking the activation checkbox.
- Under the Conditions section near the bottom of the form display, click on the link labeled 'Add Filter Logic'.
- Paste the following filter logic value in the field -- and save your results.

```bash
1 OR (2 AND 3) OR (2 AND 4 AND 5) OR (2 AND 4) OR (4 AND 5 AND 6)
```
#### Configure Your B2C Instance

18. With the AuthProvider verified and match rules in place, you are now in a position to conduct your first test of the integration between B2C Commerce and the Salesforce Platform.  Please execute the following CLI command to configure your B2C Instance:

```bash
npm run crm-sync:sf:b2cinstance:setup
```

> This command will seed the B2C Instance record, retrieve the B2C Commerce CustomerLists and Sites, and set up the base configuration for all of these records.  It leverages a Salesforce REST API that interacts with B2C Commerce via OCAPI.

#### Build and Deploy b2c-crm-sync to Your Commerce Cloud Sandbox

19. Generate the B2C Commerce metadata required by b2c-crm-sync and deploy both the code metadata to the Salesforce B2C Commerce instance by executing the following CLI command:

```bash
npm run crm-sync:b2c:build
```
> This CLI command will generate the services.xml file based on the previously generated connected apps step #4, generate a zip archive containing the metadata required by b2c-crm-sync, deploy this archive, generate a zip archive containing the b2c-crm-sync cartridges and deploy this archive to the B2C Commerce instance.

#### Update the Allowed Origins in OCAPI Permissions to Allow ScratchOrg Access

20.  The B2C Commerce instance's OCAPI permissions must be extended to allow the scratchOrg to create a storefront session for the Order on Behalf Of shopping experience.  This can be done by adding the scratchOrg urls to the OCAPI shop permissions as allowed origins.

- Log into the Business Manager.
- Navigate to Administration > Site Development > Open Commerce API Settings.
- Select 'Shop API' and 'Global' from the available select boxes.
- Add your Salesforce scratchOrg urls to the `allowed origins` section of the configuration.
  
```json
    "client_id": "[-------insert your clientId here---------------]",
    "allowed_origins": [
        "https://[---scratchOrg custom urlPrefix----].lightning.force.com",
        "https://[---scratchOrg custom urlPrefix----].my.salesforce.com"
    ],
```

The `scratchOrg custom urlPrefix` represents the portion of the scratchOrg url that is dynamical generated and unique.  The `allowed_origins` setting should have two urls that leverage this prefix with different suffixes.

If your scratchOrg url is `enterprise-ability-12345-dev-ed.lightning.force.com`, your `allowed_origins` entries will be:

```json
    "client_id": "[-------insert your clientId here---------------]",
    "allowed_origins": [
        "https://enterprise-ability-12345-dev-ed.lightning.force.com",
        "https://enterprise-ability-12345-dev-ed.my.salesforce.com"
    ],

```

- Always remember to save your changes and confirm that they've been written to your Business Manager environment.

#### Create the Order of Behalf Of Anonymous Customers

The B2C Commerce Order on Behalf Of feature only supports the creation of shopping sessions for registered storefront customers.  b2c-crm-sync extends this capability to anonymous storefront shoppers.  

21.  Execute the following CLI command to create B2C Commerce customer profiles that will be used by Service Agents to authenticate against B2C Commerce to create anonymous agent-driven shopping sessions.

```bash
npm run crm-sync:oobo:customers:create
```

> This command will register a B2C Commerce customerProfile with the customerNo `9999999` for every customerList mapped to configured sites.  These customers are mapped to B2C Sites created in the Salesforce Platform so that agents can create shopping sessions using these profiles.

The Agent will log in to the storefront using these customerProfiles when creating anonymous shopping sessions.  The storefront will recognize the anonymous OOBO customer profiles, and automatically log the customerProfile out of their registered session.  This leaves the Agent with the anonymous shopping session.

### Salesforce Customer 360 Platform Configuration Instructions

#### Validate Your Installation
You can validate your installation by executing the Salesforce Platform Apex unit tests as well as the b2c-crm-sync multi-cloud unit-tests that are included with this enablement solution.

##### Executing Apex Tests
Apex unit-tests can be executed directly from the command-line via SFDX.  Please use this command to execute the Apex unit tests that are included with b2c-crm-sync:

```bash
sfdx force:apex:test:run
```
> The Apex unit-tests should return with a message providing instructions on how to view the test results.  For additional SFDX commands related to executing Apex tests, please visit the [Salesforce Platform CLI Reference: Apex Commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_apex.htm) page.

##### Executing Multi-Cloud Unit Tests
The multi-cloud unit-tests are designed to exercise your B2C Commerce Sandbox and Salesforce Platform ScratchOrg via REST APIs to validate the installation is successful.

> The B2C Commerce interactions are dependent on the deployment of the **RefArch and RefArchGlobal sites**.  Each site should be associated to its own separate CustomerList.

> :warning: &nbsp; Do not associate both sites to the same CustomerList -- as this will cause tests dependent on multiple customer-lists to fail. &nbsp; :warning:

Exercise the multi-cloud unit-tests by executing the following CLI command.  These tests exercise integration from both B2C Commerce and the Salesforce Platform:

```bash
npm run crm-sync:test:use-cases
```

> This CLI command will execute the multi-cloud unit tests designed to validate the Salesforce environment's duplicate management configuration, bi-directional customer profile synchronization between B2C Commerce and the Salesforce Platform, and progressive customer resolution scenarios.

#### What's Next?
At this point, you should be in a position to 1) start exercising the integration or 2) [ask a question](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/discussions/new) or [log an issue](https://github.com/sfb2csolutionarchitects/b2c-crm-sync/issues/new) if the installation and configuration didn't complete as expected.  Please share your experience with us. :grin:

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
