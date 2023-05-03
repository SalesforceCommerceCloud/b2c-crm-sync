# Salesforce B2C Commerce / Customer 360 Platform Integration #

# :warning: PLEASE READ BEFORE USING THIS FRAMEWORK :warning: #

Before using b2c-crm-sync, please have a look at the [presentation page](https://salesforcecommercecloud.github.io/b2c-crm-sync/) and acknowledge that you understand and know the concepts behind this framework.

----

## Introduction ##
Salesforce B2C Commerce / CRM Sync is an enablement solution designed by Salesforce Architects to teach Salesforce's B2C Customer Data Strategy for multi-cloud use-cases. The solution demonstrates a contemporary approach to the integration between Salesforce B2C Commerce and the Cloud products running on the Salesforce Customer 360 Platform.

b2c-crm-sync includes a framework for integrating these clouds (ex. B2C Commerce and Service Cloud) -- leveraging REST APIs and the declarative capabilities of the Salesforce Platform. This approach powers frictionless customer experiences across B2C Commerce, Service, and Marketing Clouds by resolving and synchronizing customer profiles across these Salesforce products.

> :100: &nbsp;This repository is currently in it's **v3.0.0** release. The MVP feature-set is complete, and you can now deploy b2c-crm-sync to scratchOrgs and sandboxes via its CLI tooling. Solution trustworthiness is critical for our success. Please use the tagged release, but also feel free to deploy from master if you want to work with the latest updates. &nbsp;:100:

Please visit our [issues-list](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues) to see outstanding issues and features, and visit our [discussions](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/discussions) to ask questions.

> That's correct. If you have a B2C Commerce Sandbox and a [Salesforce Platform DevHub](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev) -- you can get this integration setup in an hour your very first time implementing b2c-crm-sync. Average deployment times for experienced developers and architects to a scratchOrg in under 60 minutes.

## Application Overview ##
b2c-crm-sync enables the resolution, synchronization, viewing, and management of Salesforce B2C Commerce Customer Profiles within the Salesforce Platform as either Accounts / Contacts or Person Accounts. The project serves as foundation for customized integration between B2C Commerce and the Salesforce Platform. It is designed to teach the data strategy used to synchronize B2C Customer Profiles -- and extended to support multi-cloud use-cases between B2C Commerce, Marketing Cloud, and the Salesforce Platform (ex. Service, Sales, Loyalty Cloud, etc).

> Please note that this integration is an 'above the API' integration achieved via REST services -- and is not a low-level platform integration. Think of this repository as a guide for integrating B2C Commerce and the Salesforce Customer 360 Platform leveraging REST APIs, custom code, and a subset of its declarative features.

b2c-crm-sync leverages Salesforce B2C Commerce Open Commerce REST APIs to interact with B2C Customer Profiles -- and a Salesforce Platform REST API to 'announce' when shoppers register or modify B2C Commerce Customer Profiles. Through these announcements, the Salesforce Platform requests the identified data objects (ex. customers) via REST APIs -- and then ingests elements of those data objects to create Account / Contact or PersonAccount representations of B2C Commerce Customer Profiles.

### License
This project, its source code, and sample assets are all licensed under the [BSD 3-Clause](License.md) License.

Please remember that this project **should not be treated as Salesforce Product**. It is an enablement solution designed to teach Salesforce's B2C Customer Data Strategy for B2C multi-cloud use-cases. Customers and partners implement this at-will with no expectation of roadmap, technical support, defect resolution, production-style SLAs.

> Roadmap, enhancements, and defect resolution will be driven by the Salesforce Community. You are invited to [log an issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues/new/choose) or [submit a pull-request](Contributing.md) to advance this project.

### Support
This project is maintained by the **Salesforce Community**, and it is contributed to by the Salesforce SCPPE and Service Delivery teams within the Customer Success Group (CSG) and Alliances and Channels. Salesforce Commerce Cloud or Salesforce Platform Technical Support do not support this project or its setup.

> :confetti_ball: &nbsp; We are always seeking contributions from our community of Architects and developers. If you are looking to learn how to integrate these products, consider extending this project to support your use-case.

For feature requests or bugs, please [open a GitHub issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues/new/choose). Contributions are ALWAYS WELCOME -- and they benefit the broader community.

## Feature Summary
b2c-crm-sync supports the following extensible features (yes, you can customize everything):

- Configuration of multiple B2C Commerce environments (either Sandboxes or Primary Instance Group environments) within the Salesforce Customer 360 Platform
- Configuration of multiple B2C Commerce CustomerLists and Sites within the Salesforce Customer 360 Platform
- Secure and password-less integration between B2C Commerce and the Salesforce Platform via JWT (Java Web Tokens or 'jots')
- Granular integration control managing which instances, customerLists, and sites can interact with B2C Commerce and receive integration messages
- Supports both PersonAccounts and Account / Contact customer models within the Salesforce Customer 360 Platform
- Synchronization of registered Salesforce B2C Commerce customer profiles between the Salesforce Customer 360 Platform and Salesforce B2C Commerce in near real-time and via a scheduledJob managed by B2C Commerce
- Order on Behalf of style Assisted Shopping for Customer Service Representatives configured and launched from within the Salesforce Platform
- Password Reset for Customer Service Representatives configured and launched from within the Salesforce Platform
- Federated Access to the B2C Commerce Customer Address Books of Registered B2C Commerce Customers via Salesforce Connect (requires Enterprise Edition) or from a custom LWC displayed right from the Contact/PersonAccount record page if you cannot use the Salesforce Connect
- Access to the B2C Customer Active Customer promotions through a custom flow and custom LWC components, which allow agents to see the active B2C Customer promotions right from the record page. This LWC component also allow agents to see the coupons related to the promotions to better engage customers.
- Attribution of Salesforce Platform Account and Contact identifiers on Registered and Anonymous Orders placed via the Storefront
- Headless Support for synchronization and order attribution use-cases

> We leverage [Salesforce SFDX for Deployment](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev), [Flow for Automation](https://trailhead.salesforce.com/en/content/learn/modules/flow-builder), [Platform Events for Messaging](https://trailhead.salesforce.com/en/content/learn/modules/platform_events_basics), [Salesforce Connect for Data Federation](https://trailhead.salesforce.com/en/content/learn/projects/quickstart-lightning-connect), and [Apex Invocable Actions](https://trailhead.salesforce.com/en/content/learn/projects/quick-start-explore-the-automation-comps-sample-app) to support these features. If you're a B2C Commerce Architect interested in learning how to integrate with the Salesforce Platform -- this is the project for you :)

## Setup Guidance

### Deployment Considerations
This repository should be treated as an enablement solution that can be extended by customers and partners to support their specific implementation needs. Implementing this solution will require configuration, customization, runtime-performance evaluation, and testing. That said, it should also accelerate your implementation by providing you with a foundation you can build -- and innovate on.

> Do NOT deploy this enablement solution directly to a staging or production environment without first going through your development, QA, or CI process. Remember that this solution is not supported by Salesforce Technical Support -- but you can always [open a GitHub issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues/new/choose) if you run into trouble.

### Environment Requirements
b2c-crm-sync requires a [B2C Commerce Sandbox](https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox) and a [Salesforce DevHub](https://help.salesforce.com/articleView?id=sf.sfdx_setup_enable_devhub.htm&type=5) capable of creating [scratchOrgs](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx). It can also be deployed to [Salesforce Sandboxes](https://help.salesforce.com/articleView?id=sf.data_sandbox_create.htm&type=5)  leveraging [SFDX and Salesforce's metadata API](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_develop_any_org.htm). [Salesforce Enterprise Edition](https://help.salesforce.com/articleView?id=sf.overview_edition.htm&type=5) configured with [Salesforce Connect](https://trailhead.salesforce.com/en/content/learn/projects/quickstart-lightning-connect) is required to take advantage of the federated B2C Customer Address-book feature included with b2c-crm-sync.

> b2c-crm-sync can be deployed to a B2C Commerce Sandbox and Salesforce scratchOrg in 30-60 minutes following the instructions outlined in this ReadMe. Please [set up your Salesforce DevHub](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_setup_enable_devhub.htm) and [SFDX](https://developer.salesforce.com/tools/sfdxcli) before moving forward with the installation process.

### Node.js Setup Instructions
b2c-crm-sync leverages [node.js enabled CLI](https://github.com/tj/commander.js/) and [SFDX (Salesforce CLI)](https://developer.salesforce.com/tools/sfdxcli) commands. You'll want to ensure that you have [node v15.2.1](https://nodejs.org/en/blog/release/v15.2.1/) running. If you're new to node, we recommend setting up [nvm](https://github.com/nvm-sh/nvm) to manage multiple node versions.

> Use these articles to set up [nvm](https://github.com/nvm-sh/nvm) on your local workstation. It's worth the effort to set this up, as it introduces great flexibility if you have projects that are dependent on specific node versions.

- You can [install nvm on the mac](https://jamesauble.medium.com/install-nvm-on-mac-with-brew-adb921fb92cc) using [brew](https://jamesauble.medium.com/install-nvm-on-mac-with-brew-adb921fb92cc).

- You can also [install nvm on windows](https://dev.to/skaytech/how-to-install-node-version-manager-nvm-for-windows-10-4nbi).

#### Verify Your Node.js Version
Once you have node installed, you can verify your local node version with the following command:

```bash
node --version
```

> This should return the version number of your active node.js version. This command will return **v15.2.1** if node.js has been set up correctly.

#### Install the b2c-crm-sync CLI Project
With node.js setup, you can now install the project dependencies with the standard npm install command:

```bash
npm install
```
> Installing the project dependencies will take a moment or two. Please [log an issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues/new) if you run into installation issues setting up the project.

#### Apply non-breaking Audit / Fixes
Once the installation has been completed, you can apply non-breaking updates to node packages that are leveraged by b2c-crm-sync:

```bash
npm audit fix
```

> Please remember that forcing breaking changes with the `--force` option can also break the b2c-crm-sync install process. This isn't recommended.

#### Install SFDX for SFDC Deployments
b2c-crm-sync also requires [SFDX](https://developer.salesforce.com/tools/sfdxcli) -- as it is used to create scratchOrgs and deploy the meta-data that powers it. You can [verify your SFDX installation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm) with the following command:

```bash
sfdx --version
```

> As of v3.0.2 -- this build has been tested against **node.js v16.13.0** and **sfdx v7.162.0 darwin-x64**.

### B2C Commerce Setup Instructions

#### Setup the Demo B2C Commerce Storefronts
b2c-crm-sync is designed to work with existing B2C Commerce storefronts. In the event that you do not have a storefront, you can use the existing leverage [Salesforce's Storefront Reference Architecture](https://trailhead.salesforce.com/content/learn/modules/cc-digital-for-developers) storefronts provided by Salesforce. The RefArch and RefArchGlobal storefronts can be installed in any B2C Commerce sandbox using these instructions.

> If you have a B2C Commerce Sandbox, you can install the latest SFRA Build from the Administration Menu. This **will not impact any other sites** that may already exist in your sandbox environment.

1. Open the Business Manager Administration Menu.
2. Under Site Development, select the `Site Import / Export` menu option.
3. In the import section, select `Storefront Reference Architecture Demo Sites` and click the `Import` Button to continue.
4. Select which SFRA build you'd like to leverage, scroll down to the bottom of the page and click the `Deploy` Button to install the site.

> If you are new to B2C Commerce, please use the default SFRA build to deploy in your sandbox. The deployment and setup process takes about 10 minutes, and your sandbox environment will notify you via email when the deployment is complete.

#### Setup the RefArchGlobal Site to Use Its Own CustomerList
b2c-crm-sync supports [multiple sites and customerLists](https://documentation.b2c.commercecloud.salesforce.com/DOC2/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fcustomers%2Fb2c_customer_lists.html). To see this in action, please ensure that the RefArchGlobal site leverages its own CustomerList. SFRA ships with multiple customerLists -- but with its default setup, the RefArch customerList is associated to both the RefArch and RefArchGlobal sites.

> b2c-crm-sync's integration tests require that the SFRA RefArchGlobal storefront map to the RefArchGlobal CustomerList. This association can be made by editing the CustomerList association on the RefArchGlobal site.

1. Open the Business Manager Administration Menu.
2. Select the`Manage Sites` option under the Sites menu.
3. Select the `RefArchGlobal` site from the list of available sites by clicking on the siteId.
4. Update the CustomerList association by changing the select value to **RefArchGlobal**.
5. Click `Save` to save your changes.

Please note that this isn't a requirement -- but if you want a 100% pass-rate on our multi-cloud unit tests, you should make this change. A number of our unit-tests exercise the RefArch and RefArchGlobal customer lists to test our customer resolution business rules.

>  A subset of the Multi-cloud unit tests will fail if your RefArch and RefArchGlobal sites leverage the same customerLists vs. having their own. If you experience test failures, please review the test description for references to multiple customerLists.

#### Enable the Agent Permissions on the Administrator Role
The Order on Behalf Of (Assisted Shopping) use-case requires that Business Manager users representing Customer Service Agents have B2C Commerce permissions to login and place orders on behalf of registered storefront shoppers. The Administrator role can be extended to include these permissions.

> In a production environment, a separate role should be created for Agents that provides the minimally required functional permissions. Do not provide Agents with access to an over-permissioned Administrator role.

1. Open the Business Manager Administration Menu.
2. Select the `Roles and Permissions` option from the Organization menu.
3. Select the `Administrator` role.
4. Select the `Functional Permissions` tab within the Administrator role properties.
5. Select the `RefArch` and `RefArchGlobal` sites from the Context modal. This will set the context for permission changes applied to the Administrator role.
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

> The Order on Behalf Of experience minimally requires the `Login_On_Behalf`, `Login_Agent`, and `Create_Order_On_Behalf_Of` functional permissions. The other permissions can be included to extend the Agent capabilities.

8. Click `Update` to apply these functional permissions to the Administrator role.

#### Enable Debug and Custom Log Generation
b2c-crm-sync will audit all authentication and REST API call-outs made to the Salesforce Platform via customLogs. The generated logFiles are instrumental when troubleshooting unexpected behaviors. Please enable the debug logging-level in your B2C Commerce sandbox prior to deploying b2c-crm-sync.

> The log files are instrumental when you need to troubleshoot scenarios like "why isn't my customer syncing to Salesforce when I make an update in B2C Commerce?". Pro-actively enable logging to simplify future troubleshooting.

1. Open the Business Manager Administration Menu.
2. Select the `Custom Log Settings` option from the Operations menu.
3. Set the **root** log level to `DEBUG` using the available picklist.
4. Ensure that `INFO` and `DEBUG` are among the selected log levels that will be written to log files.
5. Include an e-mail address where `FATAL` errors can be emailed when caught.
6. Click `Save` to apply these settings and enable b2c-crm-sync logs to be written to your sandbox.

> Log entries can be viewed via [Log Center](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_log_center.html?cp=0_11) or directly from the [Site Development](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/content/b2c_commerce/topics/web_services/b2c_web_service_logging_and_troubleshooting.html) landing page within Business Manager. Use the generated log files to inspect REST API calls made from B2C Commerce to the Salesforce Platform.

#### Create Your Business Manager Access Keys
B2C Commerce offers [Access Keys](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_access_keys_for_business_manager.html?) as an alternative form of authentication when logging into to Business Manager via external applications: WebDAV File Access, UX Studio Agent, User Login, OCAPI, and Protected Storefront Access. You can use these keys to access log files as well as to authenticate Agents for the Order on Behalf Of use-case.

> Please use these instructions to generate the `Agent User Login and OCAPI` and `WebDAV File Access and UX Studio` access keys for your login.

1. Click on your userName (full name) in the header navigation menu.
2. From your profile, click on the link titled `Manage Access Keys`.
3. Click on the `Generate Access Key` button to select an access key to generate.
4. Select `Agent User Login and OCAPI` from the **Generate Access Key** picklist.
5. Click on the `Generate` button to generate your access key.

> Please copy and download the generated access key -- and keep it in a safe place. You'll need to place this key in your .env file and use it as part of your password for Agent authentication.

6. Click on the `Generate Access Key` button to select an access key to generate.
7. Select `WebDAV File Access and UX Studio` from the **Generate Access Key** picklist.
8. Click on the `Generate` button to generate your access key.

> Please copy and download the generated access key -- and keep it in a safe place. You'll need to authenticate against your sandbox if you want to view logFiles directly.

#### Create Your B2C Commerce Client ID
A B2C Commerce Client ID is necessary to facilitate REST API authentication between B2C Commerce and the Salesforce Platform. You can create a B2C Client ID via [Account Manager](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_overview.html?) Portal.

> b2c-crm-sync leverages B2C Client IDs to identify a B2C Commerce instance to Account Manager and authorize REST API interactions via JWT. We recommend `creating a new B2C Client ID` for b2c-crm-sync vs. leveraging an existing B2C Client ID.

1. Go to [https://account.demandware.com](https://account.demandware.com)
2. Go to the `API Client` menu

> Please note that you will need API User rights in Account Manager to create a B2C Client ID. Please request access from your Account Manager Administrator if you do not see the `API Client` or `Add API Client` options in the Account Manager menu.

3. Click on the `Add API Client` button at the top right of the page
4. Enter a display name and a password. The password corresponds to the `B2C_CLIENTSECRET` environment variable that you'll set up in the next section.
5. Specify your company's organization as the organization for this B2C Client ID.
6. Within the OpenID Connect section, please ensure to configure at least the following:
- Default Scopes: `mail`
- Allowed Scopes:

```log
mail
roles
tenantFilter
profile
```

- Token Endpoint Auth Method: `private_key_jwt`
- Access Token Format: `JWT`

7. Click the `Save` button to apply these changes to your ClientID's configuration.

Re-open the ClientID page -- and keep it open until the last section of the setup. You'll have to update the B2C Client ID configuration to include the JWT certificate you'll create later during setup.

> Remember to capture the **B2C Client ID value** and **password** applied during this process. You will need to add both properties to the .env file via the `B2C_CLIENTID` and `B2C_CLIENTSECRET` properties.

#### Setup Your .env File
We use the [dotenv](https://medium.com/@thejasonfile/using-dotenv-package-to-create-environment-variables-33da4ac4ea8f) node.js library to store environment-specific configuration settings used to authenticate against a given B2C Commerce environment. Before installing any of the project package dependencies, please follow these instructions to build-out a .env file that contains your environment's configuration settings.

- Rename the example file 'sample.env' to '.env' in the root of the repository.

> This file shouldn't be checked into the repository, and is automatically being ignored by Git.

- Open the .env file and edit the following information. Please update these values to reflect your sandbox environment's configuration properties.

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
|  B2C_INSTANCENAME | | Represents a shorthand descriptor for the B2C_HOSTNAME; no spaces, underscores, or hyphens please |
|  B2C_CLIENTID |x| Represents the B2C Commerce Account Manager ClientID used to authenticate against the identified B2C Commerce environment. See the following [Create Your B2C Commerce Client ID](#create-your-b2c-commerce-client-id) chapter for additional information.|
|  B2C_CLIENTSECRET |x| Represents the B2C Commerce Account Manager password that corresponds to the identified ClientID|
|  B2C_SITEIDS |x| Represents a comma-delimited list of sites to deploy b2c-crm-sync to |
|  B2C_CODEVERSION |x| Represents the B2C Commerce code version to which the b2c-crm-sync's plugin cartridges will be deployed. See [Manage Code Versions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_managing_code_versions.html#) for additional information.|
|  B2C_DATARELEASE |x| Represents the B2C Commerce data release to be deployed to the specified B2C Commerce environment |
|  B2C_USERNAME |x| Represents the Account Manager username with permissions to access the B2C Commerce environment identified in the hostname |
|  B2C_ACCESSKEY  |x| Represents the B2C Commerce web access key that can be used to authenticate against the specified B2C Commerce environment. See [Create an Access Key for Logins](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_access_keys_for_business_manager.html#) for additional information. Choose the scope 'Agent User Login and OCAPI' to generate the Access Key used for B2C Commerce deployments.|
|  B2C_CERTIFICATEPATH | | Represents the path to the certificate to use during the two-factor authentication against the B2C Commerce environment Please note this should be used for Staging Environments only: See [Configure Secure Code Uploads](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_secure_code_uploads.html#) for more information.|
|  B2C_CERTIFICATEPASSPHRASE | | Represents the passphrase of the certificate to use during the two-factor authentication against the B2C Commerce environment. Please note this should be used for Staging Environments only: See [Configure Secure Code Uploads](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_secure_code_uploads.html#) for more information.|

The CLI build tools present within this solution will use this information to remotely authenticate against your environment via B2C Commerce REST APIs prior to attempting any import, upload, or re-index activity. They are also used to automate the creation of Salesforce Platform meta-data describing the B2C Commerce environment and Named Credentials used to access the B2C Commerce instance.

> Prior to saving your file, please verify that the url is correct, that the instanceName has no spaces, hyphens, or underscores -- and that the clientId / clientSecret are accurate. This information must be accurate in order for these activities to successfully process the site-import.

#### Configure Your B2C Commerce OCAPI Permissions
The build scripts in this repository leverage B2C Commerce's [sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci) automation library. This library performs a number of continuous-integration related tasks that enable the site-data uploading and import. Before we can leverage the automation tasks, the Salesforce B2C Commerce environment's OCAPI Data API permissions must be enabled to support remote interactions.

> Yes, we will be porting this to leverage the new B2C Commerce APIs in a future release. For now, all use-cases can be satisfied via OCAPI.

##### Configure Your Shop API Permissions
> We leverage the Shop API to facilitate enable Headless use-cases, multi-cloud unit tests that can be executed via the CLI, and to support Assisted Shopping (OOBO) via the B2C Commerce storefront.

- Log into the Business Manager.
- Navigate to Administration > `Site Development` > `Open Commerce API Settings`.
- Select `Shop API` and `Global` from the available select boxes.
- Add the following permission set for your clientId to the existing configuration settings. Map your allowed-origins to point to your Salesforce environment (you may have to come back and set this after your scratchOrg is created below).
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
        "resource_id": "/customers/*/password_reset",
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
    },
    {
        "resource_id": "/promotions/({ids})",
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)"
    }
  ]
}
```

> Depending on your sandbox configuration, you may need to copy these configuration settings to specific Sites (vs. applying them globally).

#### Configure Your Data API Permissions
> We leverage the Data API to facilitate server-to-server updates from the Salesforce Platform to B2C Commerce. When a user modifies a customer profile in the Salesforce Platform, the platform publishes those updates to B2C Commerce via the B2C Commerce DATA API.

- Select 'Data API' and 'Global' from the available select boxes.
- Add the following permission set for your clientId to the existing configuration settings. Map your allowed-origins to point to your Salesforce environment (you may have to come back and set this after your scratchOrg is created below).
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
    },
    {
        "methods": [
            "get"
        ],
        "read_attributes": "(**)",
        "write_attributes": "(**)",
        "resource_id": "/sites/*/coupons/{coupon_id}/codes"
    }
  ]
}
```

> Remember to replace the **client_id** and **allowed_origins** examples included here with values that reflect your own security and environment configuration settings.

#### Configure Your B2C Commerce WebDAV Permissions
The build scripts in this repository require that the clientId configured in the .env file also have read / write WebDAV permissions. Please use the following instructions to configure the WebDAV permissions for your clientId.

- Log into the Business Manager.
- Navigate to Administration > Organization > WebDAV Client Permissions.
- Add the following permission sets for your clientId to the existing configuration settings.

> Remember to replace the 'client_id' with the clientId that is configured in your .env file. If you already have clientId permissions created, please add the resources outlined in the snippet below to the existing clientId configuration.

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
All Salesforce Customer 360 Platform code and meta-data can be deployed to a [scratch org leveraging SFDX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx). CLI commands in this repository support automation of the deployment process, and the .env file can be extended to include additional variables to automate B2C Commerce service and metadata configuration.

> Please use [Trailhead's Quick Start: Salesforce DX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx) as a guide to set up a DevHub that can generate Salesforce scratchOrgs.

- Open the .env file and edit the following information. Please use these defaults -- and edit them to accommodate your org creation and deployment preferences.

> ScratchOrgs can be configured using the [base](./config-dx/b2c-base-scratch-def.json) or [personaccounts](./config-dx/b2c-personaccounts-scratch-def.json) profiles.  The base profile supports Accounts / Contacts, while the personaccounts profile supports PersonAccounts.

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_SCRATCHORGPROFILE=base
SF_SCRATCHORGALIAS=crmsync
SF_SCRATCHORGSETDEFAULT=true
SF_SCRATCHORGFORCEOVERWRITE=true
SF_SCRATCHORGDURATIONDAYS=14
```
The following table describes each of the Scratch Org specific .env file variables that are leveraged by b2c-crm-sync's build and deployment tools.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_SCRATCHORGPROFILE |x| Represents the scratchOrg profile to leverage when creating an org (use either 'base' or 'personaccounts') |
|  SF_SCRATCHORGALIAS | | Describes the alias to apply to created scratchOrgs |
|  SF_SCRATCHORGSETDEFAULT | | Manages whether any newly created scratchOrgs should automatically be set as the default |
|  SF_SCRATCHORGFORCEOVERWRITE | | Manages whether deployments to a scratchOrg should force overwrite the code and meta-data present in the scratchOrg |
|  SF_SCRATCHORGDURATIONDAYS | | Specify the scratch org's duration, which indicates when the scratch org expires in days (1 - 30). |

The build tools will use this information to create scratchOrgs, set default preferences, and control whether deployments should force overwrites to their target environment.

> Prior to saving your file, please verify that the scratchOrg profile uses one of the two supported values ('base' or 'personaccounts'). Any values not set will automatically default to base preferences managed via the /config/default.js configuration file.

You will leverage the .env file's configuration properties to dramatically simplify the build and deployment of b2c-crm-sync. Check the package.json for the complete set of CLI commands that can be used to automate meta-data generation, service definition creation, and validate environment configurations prior to deployment.

### Deployment Instructions
The b2c-crm-sync repository includes a collection of CLI commands that can be used to prepare and deploy the b2c-crm-sync assets to B2C Commerce and a Salesforce Customer 360 Platform scratchOrg.

The CLI commands leverage the [.env file](sample.env) configuration to retrieve runtime execution values. They also include support for command-line argument equivalents of the .env configuration values. Each command has an associated [api method](lib/cli-api) that can be leveraged from within custom deployment scripts.

> Before running any commands below be sure to run `npm install` from the root of the b2c-crm-sync repository folder. These commands are dependent on the project successfully being installed in your workspace. You can inspect the complete collection of commands via the [package.json](package.json)'s scripts section.

### Deployment and Configuration Pre-requisite Checklist

By this point, you should have completed the following configuration activities:

- [x] Installed node.js and sfdx in your local workspace.

- [x] Installed b2c-crm-sync to your local workspace.

- [x] Setup the B2C Commerce storefront(s) that will be used to exercise b2c-crm-sync. If you do not have a storefront, you can use the demo SFRA storefronts available in any B2C Commerce sandbox.

- [x] Configured the RefArch and RefArchGlobal storefronts to use independent B2C CustomerLists.

- [x] Configured the initial collection B2C Commerce OCAPI and WebDAV permissions.

- [x] Setup the Agent permissions on the Administrator role. This is a requirement if you'd like to exercise the Order on Behalf of use-case.

- [x] Created your B2C Client ID via Account Manager.

- [x] Created your B2C Sandbox Access Keys.

- [x] Created the B2C Commerce .env configuration file -- and updated it to describe your B2C Commerce and SFDX environments.

If these items have been completed, you should now be ready to move forward with the deployment and configuration of b2c-crm-sync.

> Please ensure that you have completed all of these activities prior to moving forward. Each of the checklist-item activities must be successfully completed to deploy and configure b2c-crm-sync. Moving forward without completing these activities will likely result in deployment failures.

#### Exercise the CLI Unit Tests
1. Execute the CLI unit-tests to verify that the CLI install, setup, and configuration is working as expected.

```bash
npm run crm-sync:test:cli
```

> Please note that not all CLI commands have test-coverage (most of the B2C commands do, only some SFDC commands do). That said, you shouldn't expect to see any test failures. We're always looking for more tests -- if you're interested in contributing back to this project :).

#### Exercise the B2C Commerce Unit Tests
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
> This command will verify that the credentials, clientId / clientSecret, code-version, and specified sites can all be verified against the host specified in the .env file. Errors will be reported to the console.

Please note that the code-version specified in the .env file must be valid in order for the verify command to complete successfully. The code version must be accurate to deploy the B2C Commerce SFRA cartridges that are leveraged by b2c-crm-sync.

#### Specify your Salesforce Org profile (base or personaccounts)
4. Specify what customerModel you'd like b2c-crm-sync to employ. Follow the guidance above, and specify the type of scratchOrg to generate (supporting either Accounts and Contacts, or PersonAccounts).

> The 'base' scratchOrg profile supports Accounts and Contacts. The 'personaccounts' scratchOrg profile supports PersonAccounts. The 'base' profile will be defaulted if an unrecognized value exists.

:bangbang: &nbsp; We use the orgProfile to identify if you're deploying to a Salesforce Org supporting Accounts and Contacts or PersonAccounts. scratchOrg and non-scratchOrg deployments both leverage this information. Please make sure that you specify the appropriate contactModel before proceeding. &nbsp; :bangbang:

#### List the Available Salesforce Orgs
5. List your supported Salesforce DevHubs, scratchOrgs, and their connected status. You can use this command to verify that your DevHub is available.

```bash
sfdx force:org:list --all
```
> Please refer to [Salesforce DX Usernames and Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm), the [SFDX Org command-set](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_org.htm), and the [Salesforce Platform DevHub Trail](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev) for resources on how to manage scratchOrgs.

### Non-Scratch Org DevHub Setup (Sandbox Deployment)

You can deploy b2c-crm-sync to non-scratchOrg environments by registering your Salesforce Org with your SFDX environment. The following command-set can be used to register an existing Salesforce Org so that it can be deployed to via SFDX.

> If you're deploying to a scratchOrg, feel free to skip this section and proceed to [Setup Your ScratchOrg](#scratch-org-devhub-setup).

#### Register Your Salesforce Org with SFDX
6. Authenticate against your Salesforce Org by executing the following CLI command:

> Your loginUrl should be in the form of https://login.salesforce.com or https://test.salesforce.com. SFDX will use this url to ask for your deployment and integration authorization.

```bash
sfdx auth:web:login -r [insert your loginUrl here]
```
List your SFDX configured Orgs by executing the following CLI command:

> Confirm that the Salesforce Org to which b2c-crm-sync will be deployed is now registered with your SFDX environment.

```bash
sfdx force:org:list --all
```

Set your Salesforce Org's username as the SFDX default via the following CLI command:

> Please set up your Salesforce Org's username as the default for SFDX. This will ensure command SFDX execution consistency as we deploy b2c-crm-sync.

```bash
sfdx config:set defaultusername=[insert your Salesforce Org Username Here]
```
> Confirm that your username is the default user for your SFDX environment.

```bash
sfdx force:org:list --all
```
Seed Your .env file with the configuration details of your Salesforce Org. This should include the following details:

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_HOSTNAME |x| Describes the url for the scratchOrg being integrated with a B2C Commerce instance.|
|  SF_LOGINURL |x| Describes the login url used to authenticate against the scratchOrg specified (generally test.salesforce.com)|
|  SF_USERNAME |x| Represents the username of the Salesforce Org integration / administrative user|
|  SF_PASSWORD |x| Represents the password of the Salesforce Org integration / administrative user|
|  SF_SECURITYTOKEN |x| Represents the securityToken of the scratchOrg user. You can create or reset the security token from your scratchOrg User Settings under 'Reset My Security Token.'|

The build tools will use this information to create the B2C Commerce service definitions facilitating the integration with the Salesforce Org.

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=power-dream-1234-dev-ed.lightning.force.com
SF_LOGINURL=test.salesforce.com
SF_USERNAME=test-2enmvjmefudl@example.com
SF_PASSWORD=P@ssw0rd!
SF_SECURITYTOKEN=293729347jlasfdkahjsdfkhj
```

Once you've completed this -- you can skip the Scratch Org setup and proceed to the [deployment instructions](#validate-your-env-salesforce-scratchorg-credentials).

> Do not move forward until you've updated your .env file with the `Hostname`, `LoginUrl`, `userName`, `password`, and `securityToken` properties. The build commands will fail if these details are not present in the .env file.

### Scratch Org DevHub Setup

#### Specify Your Default DevHub UserName
6. Specify your default DevHub username by executing the following CLI command. The devHubOrg-username represents the DevHub that will host your scratchOrg. Please see [Enable Dev Hub Features in Your Org](https://help.salesforce.com/articleView?id=sf.sfdx_setup_enable_devhub.htm&type=5) for details on how to set up a DevHub environment.

```bash
sfdx config:set defaultdevhubusername=[devHubOrg-username]
```

> If you experience the error **ERROR running config:set: No AuthInfo found for name [dev hub username]**, please authenticate against the selected DevHub using the [web:login SFDX command](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_auth_web.htm).

Authenticate against your Salesforce DevHub by executing the following CLI command:

```bash
sfdx auth:web:login
```

The [web:login command](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_auth_web.htm) supports multiple arguments to enable authentication against registered orgs (via the `-d -a [DebHub]` alias) or authenticate against new orgs (via the `-r [login-url]` option).

> Once executed, this command should open the Salesforce org in your browser and allow you to authenticate against the specified org with valid credentials. You should only need to execute this command when connecting to a new DevHub, and you can use the `sfdx config:set defaultdevhubusername=[devHubOrg-username]` to make this specific org your default DevHub.

After you have successfully authenticated against your DevHub, you can move forward with generating a new ScratchOrg.

#### Create a ScratchOrg (if you're deploying to one)
7. b2c-crm-sync can be deployed one of two ways: to a Salesforce Org sandbox -- or a scratchOrg. You can create your scratchOrg by executing the following CLI command:

> We've separated the scratchOrg creation from deployment -- so you can get familiar with the process for deploying to a sandbox or other non-production environment. You can skip this step if you'd like to deploy to a non-scratchOrg environment.

```bash
npm run crm-sync:sf:org:create
```
> This CLI command creates a scratchOrg using the orgShape defined in your .env file. b2c-crm-sync does not deploy code or meta-data as part of executing this CLI command.

The scratchOrg creation takes about 2-5 minutes. The CLI will output the orgId of the scratchOrg once its creation is complete. SFDX provides a [collection of CLI commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_org.htm) you can use to [manage and interact](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_org.htm) with your scratchOrg. Once its created, you can view the details of your scratchOrg via the following CLI command:

```bash
npm run crm-sync:sf:org:details
```

> This command will output the initial collection of configuration details for your scratchOrg.

### Configure Your Salesforce Org

Any org (scratchOrg, Salesforce Sandbox, or production environment) must be configured to support b2c-crm-sync. The follow set of instructions will guide you through the initial configuration steps for the Salesforce Platform.

#### Open Your Org
8. You can open an authenticated session to your scratchOrg via the following CLI command:

> You can skip this step if you're installing to a non-scratchOrg environment.

```bash
npm run crm-sync:sf:org:open
```

> This command should display the url you can use to access your scratchOrg -- and open your scratchOrg via a browser tab. The sfdx alternative to this command is `sfdx force:org:open`.

#### Reset the Password for Your Scratch Org's Administrative User
9. If you are deploying to a scratch Org, you will need to reset the user's password and configure it in your .env file. The B2C Commerce b2c-crm-sync assets require the administrative user's password for REST API authentication back to the Salesforce Org. You can view the user's details via the following CLI command:

> You can skip this activity if you are deploying to a non-scratchOrg environment.

```bash
npm run crm-sync:sf:user:details
```

> This command will output the hostName, loginUrl, userName, and Password for your scratchOrg user. The following table describes each of the Salesforce Customer 360 Platform's .env file variables that are leveraged by b2c-crm-sync's build and deployment tools to automate the creation of service definitions.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_HOSTNAME |x| Describes the url for the scratchOrg being integrated with a B2C Commerce instance.|
|  SF_LOGINURL |x| Describes the login url used to authenticate against the scratchOrg specified (generally test.salesforce.com)|
|  SF_USERNAME |x| Represents the username of the scratchOrg user|
|  SF_PASSWORD |x| Represents the password of the scratchOrg user. See [Generate or Change a Password for a Scratch Org User](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_passwd.htm) for additional information. |
|  SF_SECURITYTOKEN |x| Represents the securityToken of the scratchOrg user. You can create or reset the security token from your scratchOrg User Settings under 'Reset My Security Token.'|

The build tools will use this information to create the B2C Commerce service definitions facilitating the integration with the Salesforce scratchOrg.

#### Generate a New ScratchOrg User Password
10. The CLI output from the `npm run crm-sync:sf:user:details` command includes instructions on how to reset your scratchOrg username via the CLI. Please execute the following CLI command to reset the password for the scratchOrg's administrative user:

```bash
sfdx force:user:password:generate
```
> The reset password should be displayed via the CLI. Please refresh your user details and verify that your password has been reset via the following CLI command:

```bash
npm run crm-sync:sf:user:details
```

Your user's password should now be visible via the CLI output and the .env snippet. Copy the Salesforce Platform Configuration Properties snippet in its entirety to your .env file.

#### Update the .env File With Your Salesforce ScratchOrg Credentials
11. Copy the .env Salesforce Platform Configuration Properties to your .env file -- and save it. You may need to scroll-up before the success message display to find this section of the output display in the console.

> If you are deploying to a non-scratchOrg environment -- you'll need to seed the .env file with the same property values pointing to your Salesforce Org and administrative user.

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=power-dream-1234-dev-ed.lightning.force.com
SF_LOGINURL=test.salesforce.com
SF_USERNAME=test-2enmvjmefudl@example.com
SF_PASSWORD=P@ssw0rd!
```

:bangbang: &nbsp; Remember that these values need to be driven by your Salesforce environment and administrative user. These values must be accurate to ensure that the B2C Commerce meta-data is successfully generated and supports the integration with the Salesforce Platform. &nbsp; :bangbang:

#### Reset the SecurityToken for Your Scratch Org's Administrative User
12. Remote authentication to a Salesforce environment also requires the user's securityToken. You'll need to reset your securityToken -- as your user's password has been reset.

> You can skip this activity if you are deploying to a non-scratchOrg environment. Instead, copy your user's securityToken to the `SFSF_SECURITYTOKEN` property in your .env file.

In your org, enter Setup and find the User avatar in the header (the avatar should look like Astro, and be displayed in the upper right corner of the browser). Hovering over Astro will display the label "View Profile".

- Click on the User avatar and select the option titled **Settings**.
- From the settings menu, click on the option titled `Reset Security Token` to generate a new token for your scratchOrg user.

> Don't forget to [reset the securityToken](https://help.salesforce.com/articleView?id=sf.user_security_token.htm&type=5) for your scratchOrg user. This has to be done manually and is not included with the output generated by the `npm run crm-sync:sf:user:details` command.

- Once your token has been reset, check your email for the reset notification from your Salesforce scratchOrg.
- Copy the securityToken from the email to the `SF_SECURITYTOKEN` property of your .env file.

:bangbang: &nbsp; Remember that the values in your .env file need to be driven by your Salesforce administrative user and environment. These values must be accurate to ensure that the B2C Commerce meta-data is successfully generated and supports the integration with the Salesforce Platform. &nbsp; :bangbang:

The Salesforce Platform Configuration Properties section of the .env file should have each of the following entries populated with your org / user information:

```
######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=ability-force-217-dev-ed.cs98.my.salesforce.com
SF_LOGINURL=CS98.salesforce.com
SF_USERNAME=test-bkdoqiptuwev@example.com
SF_PASSWORD=CjYdPYEG@j7#n
SF_SECURITYTOKEN=dcN4wurBpdAB8wrDywvnyP46o
```
:bangbang: &nbsp; **Do not proceed with the next step until your securityToken has been reset** and copied to your .env file. Your authentication attempts **will fail** if you authenticate without leveraging the reset securityToken. &nbsp; :bangbang:

#### Validate Your .env Salesforce ScratchOrg Credentials
13. Test your Salesforce Platform Configuration properties by executing the following CLI Command:

```bash
npm run crm-sync:sf:auth:usercreds
```
> This command will attempt to authenticate against the Salesforce scratchOrg using the environment and credential information provided in the previous step. The CLI command will either return an error -- or return the authToken that was generated by the Salesforce Platform in response to the authentication request.

:bangbang: &nbsp; Only proceed to the next steps if you are able to successfully validate that your Salesforce Platform Configuration Properties are able to successfully authenticate against your scratchOrg. &nbsp; :bangbang:

#### Deploy the b2c-crm-sync Application Code to Your Salesforce Org
14. With your user details in-place, you're ready to deploy the b2c-crm-sync Salesforce Platform meta-data to your org. Please execute the following CLI command:

> The deployment of meta-data can take anywhere from 2-10 minutes. Please be patient look to the console for updates on deployment status.

```bash
npm run crm-sync:sf:org:deploy
```
> You'll use this command to deploy b2c-crm-sync to both a scratchOrg or a Salesforce environment. Deployments use [sfdx source deploy commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_source.htm) to deploy meta-data based on the orgModel employed (either `base` for Accounts / Contacts or `personaccounts` for PersonAccounts).

The deployment process customizes specific pieces of meta-data (trustedSites, remoteSiteSettings, and duplicateRules) specifically for your B2C Commerce environment and org configuration. It then deploys this meta-data with the rest of the application assets via sfdx.

:bangbang: &nbsp; Please note that running `crm-sync:sf:org:deploy` will purge the contents of the connectedApps, cspTrustedSites, duplicateRules, namedCredentials, and remoteSiteSettings meta-data folders. We generate meta-data that leverages your B2C Commerce configuration details in this folder. &nbsp; :bangbang:

> You can re-deploy meta-data using the `npm run crm-sync:sf:org:deploy` CLI command. Before attempting a re-deploy, please remember that any customized meta-data will be removed from your environment. This has to be done manually via Salesforce Setup.

One the deployment process completes -- you should see a success message via the CLI.

#### Deploy the Salesforce ConnectedApp Definitions
15. The next component of the deployment process is to deploy connectedApp definitions for each of your configured B2C Commerce storefronts. You can create and deploy the connectedApps via the following CLI command:

> Please note that connectedApps can only be deployed once. If you want to re-deploy the connectedApps, you must first remove them manually from your Salesforce Org.

```bash
npm run crm-sync:sf:connectedapps
```
This command creates a connectedApp for each of the B2C Commerce storefronts configured in your .env file. The B2C Commerce service definitions used to connect with your Salesforce Org use these connectedApps to connect securely.

#### Create and Deploy Your Duplicate Rules
16. Duplicate rules can be configured and deployed via a CLI command that retrieves the duplicateRules configuration in the Salesforce Org, identifies which b2c-crm-sync rules already exist, and creates the rule templates to deploy. Please execute this CLI command to create and deploy duplicateRules:

```bash
npm run crm-sync:sf:duplicaterules
```
> Please note that it's impossible for us to account for every Salesforce Org configuration. There is a possibility that the duplicate rules may not deploy without manual changes due to conflicts in the Salesforce Org. If that occurs, please [create an issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues) and share your experience with us.

Once completed, the duplicate rules should be deployed to your Salesforce Org. They must be configured via Setup from within your Salesforce Org.

##### Manually Configure Duplicate Rules
17. In the setup quick-find, search for Duplicate Rules (searching for 'dup' should bring up Duplicate and Match Rules). Once located, select the Match Rules setup option from the filtered setup menu.

> If you are setting up PersonAccounts, please skip this section and proceed to the section titled [PersonAccount Match Rules Setup Guidance](#personaccount-match-rules-setup-guidance).

- Ensure that the **B2C Commerce: Standard Contacts** Match rule is active.

> This rule must be active in the org as part of the Accounts / Contacts implementation. The corresponding duplicate rule is dependent on this Match Rule.

##### Account / Contact Duplicate Rules Setup Guidance

From the duplicate rules listing, select the rule titled **B2C Commerce: Standard Contacts**. Edit the rule from the detail display.

- Activate the Duplicate Rule by checking the activation checkbox.
- Under the Conditions section near the bottom of the form display, click on the link labeled 'Add Filter Logic'.
- Paste the following filter logic value in the field -- and save your results.

```bash
1 OR (2 AND 3) OR (2 AND 4 AND 5) OR (2 AND 4) OR (4 AND 5 AND 6)
```
##### PersonAccount Match Rules Setup Guidance

Leveraging the PersonAccount implementation requires a handful of additional configuration steps to disable the Contact match and duplicate rules -- and enable the related PersonAccount rules.

From the duplicate rules listing, select the rule titled **B2C Commerce: Standard Person Accounts**. Edit the rule from the detail display.

- Activate the Duplicate Rule by checking the activation checkbox.
- Under the Conditions section near the bottom of the form display, click on the link labeled 'Add Filter Logic'.
- Paste the following filter logic value in the field -- and save your results.

```bash
1 OR (2 AND 3) OR (2 AND 4 AND 5) OR (2 AND 4) OR (4 AND 5 AND 6)
```

:bug: &nbsp; We've documented an [issue with duplicate rules](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/discussions/3) for PersonAccounts where the rule fieldMappings are sometimes mapped in the incorrect order. The issue captures how to resolve this. Please verify that your duplicate rule field mappings are mapped in the correct order. In the event that they are not, you can correct this manually from within setup. &nbsp; :bug:

#### A Final Word About Duplicate Rules

> Please note that the filter logic outlined in the previous step(s) is a critical configuration step for b2c-crm-sync. Failure to configure this duplicate rule property will prevent b2c-crm-sync from being able to resolve B2C Commerce customer profiles.

:bangbang: &nbsp; In the event that you experience deployment errors with duplicate rules, you can manually create, delete, and activate duplicate rules from the Salesforce UI. Please review the [Manage Duplicate Contacts and Accounts](https://trailhead.salesforce.com/en/content/learn/modules/contact-and-account-settings-in-nonprofit-success-pack/merge-duplicate-contacts-and-accounts-npsp) for guidance on how to set up and configure Duplicate Rules. &nbsp; :bangbang:

#### Create your Order on Behalf of Authentication Credentials
18. The Order on Behalf Of shopping experience requires that Service Agents in the Salesforce Platform authenticate against the B2C Commerce environment prior to creating the shopping session. A Per-User Named Credential manages this authentication via the Salesforce Platform.

Create the per-user Named Credential in the Salesforce Platform that will be used by the ScratchOrg user to act as an Agent and create virtual shopping sessions. Execute this CLI command to generate your perUser Named Credential password:

```bash
npm run crm-sync:oobo:password:display
```
> This command creates your password following the rules outlined below. Copy this password to your clipboard to simplify the perUser NamedCredential creation process.

From within your Salesforce Org, create a perUser Named Credential that will be used by your user to authenticate against B2C Commerce as a Service Agent.

- From the Salesforce Environment, click on the Astro icon in the upper right-hand corner of the UI display.
- Select the option titled `Settings` under the User Display.
- In the `My Personal Information` Menu, select the option titled 'Authentication Settings for External Systems'.
- Select the `New` button to creat a new set of authentication credentials.

> The **Authentication Settings for External Systems** form captures the credentials that can be used by agents to authenticate against other systems. Use this form to configure the B2C Commerce credentials the agent will use to authenticate against B2C Commerce.

- Map the per-user Named Credential to your scratchOrg user by clicking on the magnifying glass-icon to the right of the `User` field. Select your user from the list of Recently Viewed users.
- Use the table below to complete the remaining fields of the per-user Named Credential form.

| Property Name | Required | Expected Value                       |
|--------------:|:----:|:-----------------------------------|
|  External System Definition |x| Named Credential |
|  Named Credential |x| [b2cInstanceName]: B2C: OOBO: Named Credential |
|  Authentication Protocol |x| Password Authentication |
|  Username |x| Your B2C Commerce environment username |
|  Password |x| Your B2C Commerce AccessKey + ':' + B2C Commerce ClientSecret |

> The **username** property should use your .env file's `B2C_USERNAME` value. The **password** property should use your .env file's `B2C_ACCESSKEY` and `B2C_CLIENTSECRET` values -- separated by a `:`. It should look something similar to `1nY%|GvAnu]}tvNNe[~7zkn12]ZLU)lV~CbXzO{w:yourclientsecretpassword`.

- When all form fields have been completed, please click the `Save` button save this per-user Named Credential definition. Confirm that the per-user Named Credential has been created within your Personal Settings.

##### Validate your OOBO User Credentials

19. Please validate your B2C Commerce Agent credentials by executing the following CLI command:

```bash
npm run crm-sync:b2c:auth:bmuser
```

> This command with attempt to authenticate against the B2C Commerce environment leveraging the Agent credentials that were configured in the previous step.

Executing this command should generate an authToken that validates the BM UserName, AccessKey, and ClientSecret defined in your .env file are valid. You can use this command to troubleshoot and validate your B2C Commerce Business Manager User Credentials.

#### Generate and Download a Self-Signed Certificate for JWT Minting
20. Generate a self-signed certificate via the Salesforce Org and download it as a KeyStore. b2c-crm-sync will use the generated certificate to mint JWT AuthToken requests presented to the B2C Commerce Account Manager.

- Enter Setup within your org and in the quick-find, search for `cert`.
- Select the `Certificate and Key Management` option found under the Security menu.
- Click on the button titled `Create Self-Signed Certificate`.
- Use this table to inform the field values used to create your new self-signed cert.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  Label |x| Set to your .env file's `B2C_INSTANCENAME` value. This will be used to identify the cert within the platform. |
|  Unique Name |x| Set to your .env file's `B2C_INSTANCENAME` value. The label and unique name should be the same. |
|  Exportable Private Key |x| Check this checkbox; the privateKey should be exportable. |
|  Key Size |x| Change from 2048 to **4096**. |

- Click the `Save` button to create your new self-signed certificate.

The next step in this process is to export your certificate as a javaKeyStore. You'll decompose the keyStore via our CLI and validate B2C Commerce's Account Manager can issue you authTokens via JWT using this certificate.

- In Setup menu, click on the `Certificate and Key Management` option found under the Security menu to return to the main certificate listing.
- From the **Certificate and Key Management** display, click the button labeled `Export to KeyStore`.
- Provide a password that will be used to secure the keystore.

> Please make note of this password, as it can be used to export the public and private keys from the keystore. Record this password in a safe and secure space.

- Click the `Export` button to download the keystore files.
- Copy the keystore to the _jwt/sfdc directory.

> You should expect to download two keystore files; one for the unit-test certificate, and one used to authenticate against B2C Commerce's Account Manager.

We will use the keystore to extract the public and private keys from each downloaded file -- and leverage these keys to exercise JWT validation between B2C Commerce's Account Manager and the Salesforce Org via the CLI.

#### Extract the Public Key from the KeyStore
21. Execute the following CLI command to extract the publicKey from the KeyStore and output it via the console. We'll use the public key to update your Account Manager ClientID configuration so that you can securely get AuthTokens from Account Manager without requiring a ClientSecret for authentication.

> The command will ask you to select your keyStore from the contents of the _jwt/sfdc directory -- and enter the password you applied to the keyStore before exporting it.

```bash
npm run crm-sync:sf:cert:publickey:get
```
When prompted, select each of the keyStore files listed -- and enter the password you used to create the keyStore that was downloaded to the _jwt/sfdc directory.

> This command will parse the public key from your certificate and output its contents to the console. It expects that your cert is in the `_jwt/sfdc` directory and will throw an error if no cert exists in this directory.

Completing this command successfully should output to the console two key pieces of information describing your certificate:

- The Salesforce certificate's developerName; this is the internal / unique name applied to the certificate when created
- The Salesforce certificate's base64 content; this is the component of the keyStore that will be used by Account Manager to verify the authenticity of b2c-crm-sync authToken requests

We need the certificate developerName to default certificate associations across your B2C Instance's CustomerLists and Sites. Please copy the developerName value
to your .env file via the `SF_CERTDEVELOPERNAME` value. The CLI command will output an updated representation of your **Salesforce Platform Configuration Properties**
that includes the seeded `SF_CERTDEVELOPERNAME` value.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  SF_CERTDEVELOPERNAME |x| Represents the developerName of the self-signed certificate used by the Salesforce Platform to mint JWT tokens and by the B2C Commerce Account Manager to validate JWT tokens.|

:bangbang: &nbsp; Do not use the `b2ccrmsync_testing` certificate to configure your B2C Commerce Client ID's certificate configuration. Use the certificate added to your .env's `SF_CERTDEVELOPERNAME` configuration property. &nbsp; :bangbang:

> The certDeveloperName will be used to broker REST API authorization between the Salesforce Platform and B2C Commerce -- enabling the Salesforce Platform to leverage B2C Commerce REST APIs. The certificate will be written to the `_jwt/sfdc` directory using the certificate developerName as the filename. You can access this file if you need to reference the certificate in the future.


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
> Please copy the `SF_CERTDEVELOPERNAME` property to your .env file. The JWT validation CLI command depends on a seeded `SF_CERTDEVELOPERNAME` property value -- and will not function property without it.

#### Setup the JWT Certificate and AuthToken Format in Account Manager
22. Now that you have extracted the Salesforce self-signed Certificate from the downloaded JavaKeyStore, please copy the certificate definition to your clipboard. Copy everything in-between and including the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` tags -- and log into Account Manager to update your Client ID.

> A copy of the certificate should exist in your `_jwt/sfdc` directory. If you do not have one, please re-run the `crm-sync:sf:cert:publickey:get` command -- as this will re-generate the .cert file for you.

- Toggle to the Account Manager ClientID page opened in the step **Create Your B2C Commerce Client ID**.
- Locate the `Client JWT Bearer Public Key` form field under the **JWT** heading.
- Paste the copied certificate contents into the `Client JWT Bearer Public Key` field. Remove any trailing spaces or line-feeds that are copied following the `-----END CERTIFICATE-----` marker. The pasted certificate contents should not have any leading or trailing whitespace.
- Locate the `Token Endpoint Auth Method` form field near the bottom of the form. Change this value to `private_key_jwt`.
- Click `Save` to apply the public key details to the ClientID definition.

> These updates to your ClientID will enable both ClientID / ClientSecret driven AND JWT Certificate driven authentication. That said, we recommend the password-less / JWT Certificate driven approach. The non-password authentication approach makes it a preferred, trustworthy, and lower risk authentication method.

#### Validate that You Can Retrieve an Account Manager AuthToken
23. Now that the .env file has been configured to include the Salesforce self-signed certificate developerName -- let's test retrieving a B2C Commerce REST API AuthToken from Account Manager leveraging the JWT authentication approach. Please execute the following CLI command:

```bash
npm run crm-sync:b2c:auth:jwt
```
> This command is dependent on the correct JWT-specific configuration of the B2C ClientID via Account Manager and access to the public / private keys belonging to the Salesforce self-signed certificate keyStore. It is also dependent on the correct configuration of the certificate developerName within your .env file. Please ensure that these three configuration elements have been successfully completed before continuing.

If successful, the CLI output should render the authToken provided by the B2C Commerce Account Manager -- in response to successful authentication leveraging JWT. Any errors will be output to the console -- along with the request properties that were used to mint the JWT. Now, let's test that the ClientID / ClientSecret authentication method still works by executing the following CLI command:

```bash
npm run crm-sync:b2c:auth:clientcreds
```
The CLI output for this command should also render the authToken provided by the B2C Commerce Account Manager -- in response to successful authentication leveraging the ClientID / ClientSecret configured in your .env file.

> b2c-crm-sync's CLI tools primarily leverage the ClientID / ClientSecret authentication method to perform deployments to the B2C Commerce sandbox. The JWT method will be leveraged by b2c-crm-sync in the deployed Salesforce Org to authenticate against B2C Commerce's Account Manager. Once deployed, b2c-crm-sync never leverages your .env's ClientID / ClientSecret to authenticate against B2C Commerce's Account Manager.

#### Generate a Self-Signed Certificate for Unit Tests
24. Now that your user credentials have been validated, please generate an additional self-signed certificate used by b2c-crm-sync for unit-tests.

- Enter Setup within your org and in the quick-find, search for `cert`.
- Select the `Certificate and Key Management` option found under the Security menu.
- Click on the button titled `Create Self-Signed Certificate`.
- Use this table to inform the field values used to create your new self-signed cert.

| Property Name | Required | Description                       |
|--------------:|:----:|:-----------------------------------|
|  Label |x| `b2ccrmsync_testing`. This is the expected name of the certificate leveraged by Apex unitTests. |
|  Unique Name |x| `b2ccrmsync_testing`. The label and the unique name should be the same. |
|  Exportable Private Key |x| Check this checkbox; the privateKey should be exportable. |
|  Key Size |x| Change from 2048 to **4096**. |

- Click the `Save` button to create your new self-signed certificate.

> This certificate will be used by b2c-crm-sync unit-tests -- and **must be created** in the target org. Failure to create this certificate will result in **massive** unit-test failures.

##### Executing Apex Tests
25. Apex unit-tests can be executed directly from the command-line via SFDX. Please use this command to execute the Apex unit tests that are included with b2c-crm-sync:

```bash
sfdx force:apex:test:run -r json
```
> The Apex unit-tests results will be displayed in JSON format at the beginning of the output results. The result.summary object will contain the summary details of the test-run (example below).

```json
"summary": {
    "outcome": "Passed",
    "testsRan": 302,
    "passing": 302,
    "failing": 0,
    "skipped": 0,
    "passRate": "100%",
    "failRate": "0%",
    "testStartTime": "Mon Jul 26 2021 9:04:15 PM",
    "testExecutionTime": "71999 ms",
    "testTotalTime": "71999 ms",
    "commandTime": "810 ms",
    "hostname": "https://connect-efficiency-75932-dev-ed.cs90.my.salesforce.com/",
    "orgId": "00D1F000000ZMr5UAG",
    "username": "test-j9besgqaveqa@example.com",
    "testRunId": "7071F000023Gsie",
    "userId": "0051F00000oGkE3QAK"
}

```

> For additional SFDX commands related to executing Apex tests, please visit the [Salesforce Platform CLI Reference: Apex Commands](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_apex.htm) page.

### Setup the Default b2c-crm-sync Configuration Records

#### Configure Your B2C Client ID
26. With the JWT certificate in place, you can begin to set up the b2c-crm-sync application on the Salesforce Platform. The first activity to perform is to create a B2C Client ID. This ID will be used by the Salesforce Platform to authenticate against the B2C Commerce Account Manager. You can create a default B2C Client ID via the following CLI command:

```bash
npm run crm-sync:sf:b2cclientid:setup
```
> This activity will seed the B2C Client ID (B2C_Client_ID__c) custom object in the Salesforce Platform using the .env file's `B2C_CLIENTID` value. The CLI Command will verify the record has been created or reset the record with its default definition if the record exists.

#### Configure Your B2C Instance
27. b2c-crm-sync requires that a B2C Instance representing the B2C Commerce environment that will be integrated. The B2C Instance record will enable the seeding of B2C CustomerLists and Sites from your B2C Commerce environment. This default B2C Instance record can be created via the CLI via the following CLI command:

```bash
npm run crm-sync:sf:b2cinstance:setup
```
> This activity will seed the B2C Instance (B2C_Instance__c) custom object in the Salesforce Platform using the .env file's `B2C_HOSTNAME` and associate the previously created `B2C_CLIENTID` value. The CLI Command will verify the record has been created, or reset the record with its default definition if the record exists.

Executing this CLI command will trigger a flow retrieves the B2C CustomerLists and Sites from your B2C Commerce Instance -- and seeds their configuration records in your Salesforce Org. These records will also be assigned the default B2C Client ID for REST API authentication.

#### Update Your PersonAccount and Contact Page Layouts
28. b2c-crm-sync includes alternative pageLayouts for Contacts (for Account and Contact support) as well as PersonAccounts. You can use these layouts as starting points to consider how to customize your existing Salesforce Customer layouts.

> b2c-crm-sync does not make changes to any existing page layouts. We expect partners and customers to work through layout requirements and customizations on their own.

We include two additional support layouts:

- B2C (Contact) Support Layout for Accounts and Contacts
- B2C (PersonAccount) Support Layout for PersonAccounts

These layouts expose the initial set of customFields added to Contacts and PersonAccounts to support synchronization with B2C Commerce. Please review the help article [Assign Page Layouts to Profiles or Record Types](https://help.salesforce.com/articleView?id=sf.customize_layoutassign.htm&type=5) for details on how to update pageLayout assignments. You can also use the following collection of Trailhead Trails to learn how to manage pageLayouts:

> In a scratchOrg or sandbox, you'll want to associate these layouts to the Administrative Profile. In a production environment, you'll want to evaluate how to extend existing serviceAgent layouts to include B2C Commerce Customer Profile attributes. We do not recommend using the layouts included in b2c-crm-sync in production; they only exist to easily expose B2C Customer Profile attributes to developers.

- [App Customization Lite](https://trailhead.salesforce.com/en/content/learn/modules/lex_migration_customization)
- [Customize the User Interface for a Travel App](https://trailhead.salesforce.com/en/content/learn/projects/customize-the-user-interface-for-a-travel-approval-app)
- [Lightning Experience Customization](https://trailhead.salesforce.com/en/content/learn/modules/lex_customization)

> If you're a B2C Commerce Architect or Developer and unfamiliar with how to customize the Salesforce Platform's layouts -- please complete these trails as a way to gain this exposure.

#### Build and Deploy b2c-crm-sync to Your B2C Commerce Environment
29. Generate the B2C Commerce metadata required by b2c-crm-sync and deploy both the code metadata to the Salesforce B2C Commerce instance by executing the following CLI command:

```bash
npm run crm-sync:b2c:build
```
> This CLI command will generate the services.xml file based on the previously generated connected apps step #4, generate a zip archive containing the metadata required by b2c-crm-sync, deploy this archive, generate a zip archive containing the b2c-crm-sync cartridges and deploy this archive to the B2C Commerce instance.

#### Update the Allowed Origins in OCAPI Permissions to Allow ScratchOrg Access
30. The B2C Commerce instance's OCAPI permissions must be extended to allow the Salesforce org to create a storefront session for the Order on Behalf Of shopping experience. This can be done by adding the scratchOrg urls to the OCAPI shop permissions as allowed origins.

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

The `scratchOrg custom urlPrefix` represents the portion of the Salesforce Org url that is dynamical generated and unique. The `allowed_origins` setting should have two urls that leverage this prefix with different suffixes.

If your scratchOrg url is `enterprise-ability-12345-dev-ed.lightning.force.com`, your `allowed_origins` entries will be:

```json
    "client_id": "[-------insert your clientId here---------------]",
    "allowed_origins": [
        "https://enterprise-ability-12345-dev-ed.lightning.force.com",
        "https://enterprise-ability-12345-dev-ed.my.salesforce.com"
    ],

```

- Always remember to save your changes and confirm that they've been written to your Business Manager environment.

#### Activate B2C Commerce Site Preferences
31. b2c-crm-sync is manage by several storefront SitePreferences. These sitePreferences controls which customerProfile synchronization features are enabled in the B2C Commerce instance. You can use this CLI command to enable all settings:

> The customPreferences administration display in B2C Commerce's Business Manager has detailed descriptions on each sitePreference available.

```bash
npm run crm-sync:b2c:siteprefs:activate
```

By default, b2c-crm-sync only enables minimal settings. Executing this command enables customer synchronization, synchronization via OCAPI, profile creation via order scenarios, and Order on Behalf Of.

> When deploying to production, please remember to only enable the sitePreferences for the desired b2c-crm-sync features.

#### Create the Order of Behalf Of Anonymous B2C Commerce Customer Profiles
32. The B2C Commerce Order on Behalf Of feature only supports the creation of shopping sessions for registered storefront customers. b2c-crm-sync extends this capability to anonymous storefront shoppers.

Execute the following CLI command to create B2C Commerce customer profiles that will be used by Service Agents to authenticate against B2C Commerce to create anonymous agent-driven shopping sessions.

```bash
npm run crm-sync:oobo:customers:create
```

> This command will register a B2C Commerce customerProfile with the customerNo `9999999` for every customerList mapped to configured sites. These customers are mapped to B2C Sites created in the Salesforce Platform so that agents can create shopping sessions using these profiles.

The Agent will log in to the storefront using these customerProfiles when creating anonymous shopping sessions. The storefront will recognize the anonymous OOBO customer profiles, and automatically log the customerProfile out of their registered session. This leaves the Agent with the anonymous shopping session.

#### Validate Your Installation
You can validate your installation by executing the b2c-crm-sync multi-cloud unit-tests that are included with this enablement solution.

##### Executing Multi-Cloud Unit Tests
The multi-cloud unit-tests are designed to exercise your B2C Commerce Sandbox and Salesforce Platform ScratchOrg via REST APIs to validate the installation is successful.

> The B2C Commerce interactions are dependent on the deployment of the **RefArch and RefArchGlobal sites**. Each site should be associated to its own separate CustomerList.

> :boom: &nbsp; Do not associate both sites to the same CustomerList -- as this will cause tests dependent on multiple customer-lists to fail. &nbsp; :boom:

33. Exercise the multi-cloud unit-tests by executing the following CLI command. These tests exercise integration from both B2C Commerce and the Salesforce Platform:

```bash
npm run crm-sync:test:use-cases
```

> This CLI command will execute the multi-cloud unit tests designed to validate the Salesforce environment's duplicate management configuration, bi-directional customer profile synchronization between B2C Commerce and the Salesforce Platform, and progressive customer resolution scenarios.

### Setup the Salesforce Connect Extras
b2c-crm-sync includes extras that expose federated access to B2C Commerce Customer Addressbook contents via [Salesforce Connect](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/platform_connect_about.htm). This extra provides read and edit access to B2C Commerce Customer Addresses from within the Salesforce Platform.

:bangbang: &nbsp; [Salesforce Connect](https://help.salesforce.com/articleView?id=sf.platform_connect_about.htm&type=5) is a licensed capability that is available in scratch and developerOrgs. Please check your production environment to ensure that Salesforce Connect has been licensed before deploying these extras. We separate these components from the base deployment meta-data for this reason. &nbsp; :bangbang:

> b2c-crm-sync exposes customer addressbook contents using [Custom Apex Adapters](https://help.salesforce.com/articleView?id=sf.apex_adapter_about.htm&type=5) that request address data from B2C Commerce and expose that data as [External Objects](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_external_objects.htm) within the Salesforce Platform. Developers can use this pattern to access B2C Commerce data via REST APIs exposed as External Objects.

#### Deploy the Salesforce Connect Extras
You can deploy the Salesforce Connect extras for both Accounts / Contacts and PersonAccounts via the following SFDX Commands:

> Both Accounts & Contacts and PersonAccounts have their own distinct Salesforce Connect Addressbook implementations. Please choose the implementation appropriate for your Salesforce Org.

**Note: This piece is optional. By default, the B2C Commerce address book is fetched in real-time when looking at a contact/person account record from the B2C CRM Sync custom app, through a flow and a custom LWC.**

__Deploy Salesforce Connect Extras for Accounts / Contacts__

```bash
 sfdx force:source:deploy -p "src/sfdc/extras/sf-connect/base"
```

__Deploy Salesforce Connect Extras for PersonAccounts__

```bash
 sfdx force:source:deploy -p "src/sfdc/extras/sf-connect/base"
 sfdx force:source:deploy -p "src/sfdc/extras/sf-connect/personaccounts"
```

> Please note the PersonAccount implementation requires the deployment of both the `base` and `personaccount` extras. You must execute both of these deployment commands.

#### Validate and Synchronize Salesforce Connect External Objects
Salesforce External Objects must be initialized before they can be used within the Salesforce Org. Please complete these instructions to initialize the external dataSource and enable the customer addressbook features of b2c-crm-sync.

- Enter Setup.
- Search for `External Data Sources` via the quick-find search.
- Select the `External Data Sources` menu option.
- Verify that a dataSource named `B2C_Customer_Address_Book` is present in the list of external dataSources.
- Click on the name `B2C_Customer_Address_Book` to view the dataSource details.
- From the details display, click on the `Validate and Sync` button.
- From the `Validate External Data Source` display, confirm that the table name `B2C_CustomerAddress` is visible in the list of tableNames.
- Check the `Select` checkbox to the left of the `B2C_CustomerAddress` tableName.
- Click on the `Sync` button to trigger the External Data Source validation and synchronization process.

> This action will attempt to verify the dataSource connection brokered by the addressBook data adapter included with b2c-crm-sync.

B2C Commerce Customer Addressbook data should become visible as a related list on Contact / PersonAccount records once the synchronization has been successfully completed. Service Agents can view and edit address details. Edits made from within the Salesforce Platform will synchronize back to B2C Commerce.

> Partners and customers can leverage the extras code and meta-data assets as a template to access B2C Commerce data via Salesforce Connect / External Objects.

### Synchronizing Existing B2C Commerce Customer Profile

Often, a Salesforce B2C Commerce customer will need to synchronize their B2C Commerce customer-base with their Salesforce Org. Existing B2C Customer Profiles can be synchronized with the Salesforce Platform. This can be accomplished by combining a number of different strategies:

1. Customer profiles can be synchronized upon login, registration, and profile edit. This means, however, that customers must authenticate against B2C Commerce in order to trigger synchronization.

> b2c-crm-sync employs multiple custom site preferences to govern the enforcement of customer synchronization via the storefront and REST APIs.

2. The `custom.B2CCRMSync.SynchronizeCustomers` job step can be configured to incrementally export the entire database of customer profiles from B2C Commerce to the Salesforce Org. The job-step can be used to migrate B2C Commerce Customer Profiles to the Salesforce Org database in one or multiple loads.

> The job can be configured to process an entire CustomerList -- or a subset of customer profiles that exist in the CustomerList. The customQuery can be configured to process the entire customerList, or a subset of customer profiles. If the job-step does not appear in the list of available steps, please toggle the active code-version -- and try again.

The jobStep supports a Query parameter representing which profiles to synchronize via a [valid and executable profile query](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_customer_CustomerMgr.html#dw_customer_CustomerMgr_searchProfiles_Map_String_DetailAnchor). The query can contain the following dynamic placeholders:


| Today Placeholder | What to Expect / How to Use this Placeholder |
|------------------:|:--------------------------------------------------|
| `_today_ -[0-9]+` | Will return the current date time minus xx days, formatted with the date time format. This regexp allows you to apply dynamic days within the past. |
| `_today_`         |  Will return formatted date for the current day. |
| `_today_ -1`      | Will return the current date minus 1 day. |
| `_today_ -30`     | Will return the current date minus the date modifier. |

| Now Placeholder | What to Expect / How to Use this Placeholder |
|----------------:|:--------------------------------------------------|
| `_now_ -[0-9]+` | Will return current date time minus xx minutes, formatted with the date time format. This regexp allows you to apply dynamic time within the past. |
| `_now_`         | Will return the current date time, formatted with the date time format |
| `_now_ -15`     | Will return the current time minus 15 minutes. |
| `_now_ -60`     | Will return the current time minus 1 hour. |
| `_now_ -1440`   | Will return the current time minus 24 hours. |

You can use these placeholders to create custom queries to filter and migrate a sub-set of B2C Customer Profiles. Examples of these queries include:

- `createdDate > _today_ -1` filters on customerProfiles created since yesterday
- `custom.b2ccrm_syncStatus != 'exported'` filters on customerProfiles that have not been exported successfully
- `custom.b2ccrm_contactId != NULL` filters on customerProfiles that have not been attributed with a Salesforce Platform ContactID

> When creating custom queries via this job, please remember to confirm that B2C Customer Profiles exist that satisfy your constructed query. Any query that returns zero results will generate a NO DATA message in the job log-files.

### Data mapping between B2C Commerce and the Core Platform

As the B2C Commerce customer profile and its addresses are fetched by the core platform, the core platform holds the data-mapping between the core attributes and the B2C ones. You can find hereafter the detail of this mapping. The `Core Alt ID` is used in place of the `Core ID` when person accounts is enabled. The `Core ID` is used when person accounts are not enabled. If you want to modify the data mapping shipped with b2c-crm-sync, you need to:
1. Open the Salesforce Core Org
2. Click on the gear icon on the top right of the screen and click `Setup`
3. In the Quick Find box at the top left, search for `Custom Metadata` and click on this menu
4. Click on the `Manage records` on the row `B2C Integration Field Mapping`
5. You'll find all the data mapping here, that you can modify, remove, or add new attributes as part of the data mapping.


| Label               | Core Object            | Core ID                    | Core Alt ID                 | B2C Object      | OCAPI ID            |
|:-------------------:|:----------------------:|:--------------------------:|:---------------------------:|:---------------:|:-------------------:|
| Address Id          | B2C_CustomerAddress__x | AddressId__c               | (None)                      | CustomerAddress | address_id          |
| Address 1           | B2C_CustomerAddress__x | Address1__c                | (None)                      | CustomerAddress | address1            |
| Address 2           | B2C_CustomerAddress__x | Address2__c                | (None)                      | CustomerAddress | address2            |
| City                | B2C_CustomerAddress__x | City__c                    | (None)                      | CustomerAddress | city                |
| Country Code        | B2C_CustomerAddress__x | CountryCode__c             | (None)                      | CustomerAddress | country_code        |
| First Name          | B2C_CustomerAddress__x | FirstName__c               | (None)                      | CustomerAddress | first_name          |
| Last Name           | B2C_CustomerAddress__x | LastName__c                | (None)                      | CustomerAddress | last_name           |
| Phone               | B2C_CustomerAddress__x | Phone__c                   | (None)                      | CustomerAddress | phone               |
| Postal Code         | B2C_CustomerAddress__x | PostalCode__c              | (None)                      | CustomerAddress | postal_code         |
| State Code          | B2C_CustomerAddress__x | StateCode__c               | (None)                      | CustomerAddress | state_code          |
| Customer List Id    | B2C_CustomerList__c    | Name                       | (None)                      | CustomerList    | id                  |
| Brith Date          | Contact/PersonAccount  | Birthdate                  | PersonBirthDate             | Profile         | birthday            |
| Company Name        | Contact/PersonAccount  | B2C_Company_Name__c        | B2C_Company_Name__pc        | Profile         | company_name        |
| Customer Id         | Contact/PersonAccount  | B2C_Customer_ID__c         | B2C_Customer_ID__pc         | Profile         | customer_id         |
| Customer List Id    | Contact/PersonAccount  | B2C_CustomerList_ID__c     | B2C_CustomerList_ID__pc     | Profile         | customerlist_id     |
| Customer No         | Contact/PersonAccount  | B2C_Customer_No__c         | B2C_Customer_No__pc         | Profile         | customer_no         |
| Date Created        | Contact/PersonAccount  | B2C_Date_Created__c        | B2C_Date_Created__pc        | Profile         | creation_date       |
| Date Last Modified  | Contact/PersonAccount  | B2C_Date_Last_Modified__c  | B2C_Date_Last_Modified__pc  | Profile         | last_modified       |
| Date Last Visited   | Contact/PersonAccount  | B2C_Date_Last_Visited__c   | B2C_Date_Last_Visited__pc   | Profile         | last_visit_time     |
| Date Previous Visit | Contact/PersonAccount  | B2C_Date_Previous_Visit__c | B2C_Date_Previous_Visit__pc | Profile         | previous_visit_time |
| Email               | Contact/PersonAccount  | Email                      | PersonEmail                 | Profile         | email               |
| First Name          | Contact/PersonAccount  | FirstName                  | FirstName                   | Profile         | first_name          |
| Gender              | Contact/PersonAccount  | B2C_Gender_ID__c           | B2C_Gender_ID__pc           | Profile         | gender              |
| Is Enabled          | Contact/PersonAccount  | B2C_Is_Enabled__c          | B2C_Is_Enabled__pc          | Profile         | credentials.enabled |
| Is Locked           | Contact/PersonAccount  | B2C_Is_Locked__c           | B2C_Is_Locked__pc           | Profile         | credentials.locked  |
| Job Title           | Contact/PersonAccount  | B2C_Job_Title__c           | B2C_Job_Title__pc           | Profile         | job_title           |
| Last Name           | Contact/PersonAccount  | LastName                   | LastName                    | Profile         | last_name           |
| Phone Business No   | Contact/PersonAccount  | Phone                      | Phone                       | Profile         | phone_business      |
| Phone Fax No        | Contact/PersonAccount  | Fax                        | Fax                         | Profile         | fax                 |
| Phone Home No       | Contact/PersonAccount  | HomePhone                  | PersonHomePhone             | Profile         | phone_home          |
| Phone Mobile No     | Contact/PersonAccount  | MobilePhone                | PersonMobilePhone           | Profile         | phone_mobile        |
| Prefered Locale     | Contact/PersonAccount  | B2C_Preferred_Locale__c    | B2C_Preferred_Locale__pc    | Profile         | preferred_locale    |
| Salutation          | Contact/PersonAccount  | B2C_Salutation__c          | B2C_Salutation__pc          | Profile         | salutation          |
| Second Name         | Contact/PersonAccount  | B2C_Second_Name__c         | B2C_Second_Name__pc         | Profile         | second_name         |
| Site Id             | Contact/PersonAccount  | B2C_Site_ID__c             | B2C_Site_ID__pc             | Profile         | site_id             |
| Suffix              | Contact/PersonAccount  | B2C_Suffix__c              | B2C_Suffix__pc              | Profile         | suffix              |
| Title               | Contact/PersonAccount  | B2C_Title__c               | B2C_Title__pc               | Profile         | title               |
| Username            | Contact/PersonAccount  | B2C_UserName__c            | B2C_UserName__pc            | Profile         | credentials.login   |

**Note: The `B2C_CustomerAddress__x` object is only used while using the Salesforce Connect integration for the Address Book. If you are using the custom flow/LWC to render the address book within the core platform, it uses the same configuration mapping, but there is no real record created within the core platform.**

#### What's Next?
At this point, you should be in a position to 1) start exercising the integration or 2) [ask a question](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/discussions/new) or [log an issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues/new) if the installation and configuration didn't complete as expected. Please share your experience with us. :grin:

b2c-crm-sync contains multiple developer-friendly features that can be used to extend it for other use-cases. We invite everyone to set it up in a development environment -- and learn about the configuration points and sub-systems that you can manage in b2c-crm-sync.

### Let's End with Gratitude
I'd like to extend a heartfelt and personal thank you to everyone for their support, contributions, and guidance. This has been a multi-year effort spanning multiple teams at Salesforce. We've developed this data strategy and integration approach leveraging learnings from customers, partners, and our internal teams. I am grateful for these relationships, and this project would not have come to life without the support of this group.

:raised_hands: &nbsp;&nbsp;Thank you. For Everything.&nbsp;&nbsp; :raised_hands:
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
