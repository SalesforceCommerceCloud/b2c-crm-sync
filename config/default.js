module.exports = {

    // Describes the current versionNo of the service-cloud-connector
    "versionNo": "0.7.8",

    // Manages debug mode for the CLI application
    "debugMode": true,

    // Describes file-names used for deployment
    "fileNames": {

        // Describes b2c deployment filenames
        "b2c": {

            // Represents the archive storing cartridges
            "cartridgeArchive": "b2ccrmsync-code",

            // Represents the archive storing meta-data
            "metaDataArchive": "b2ccrmsync-metadata"

        }

    },

    // Define the paths used to manage deployment assets
    "paths": {

        // Define the path-labels used to drive logic
        "b2cLabel": "b2c",
        "cartridgePathLabel": "cartridges",
        "metadataPathLabel": "metadata",

        // Define the filename used to store connectedApp credentials
        "connectedAppFileName": "connectedAppCredentials.json",

        // Describes the source paths
        "source": {

            "dx": {

                // Define the file extension for meta-data templates
                "meta-ext": "-meta.xml",

                // Define the parent path for Salesforce meta-data templates
                "templates": "./src/sfdc/_templates/",

                // Define the location of deployable meta-data
                "force-app": "./src/sfdc/force-app/main/default/",

                // Define the location of .dx configuration files
                "config": "./config-dx/",

                // Define the path representing the location of personAccounts meta-data
                "personaccounts": "./src/sfdc/person-accounts",

            },

            "b2c": {

                // Source location of B2C Commerce cartridge site-data
                "meta-templates": "./src/sfcc/_templates/meta-data/",

                // Source location of B2C Commerce cartridge code
                "cartridges": "./src/sfcc/cartridges/",

                // Source location of B2C Commerce cartridge site-data
                "metadata": "./src/sfcc/site-template/"

            }

        },

        // Describe the deploy paths
        "deploy": {

            // Define the base deploy path
            "base": "./_deploy/",

            "b2c": {

                // Source location of the deployment archives for B2C Commerce cartridges
                "cartridges": "cartridges/",

                // Source location of the deployment archives for B2C Commerce site-data
                "metadata": "meta-data/",
            }
        }

    },

    // Describes the collection of CLI operation processing settings
    "operationMode": {

        // Default the operation mode for the application
        "default": "cli",
        "json": "json",

        // Default the acceptable collection of operation modes
        "validModes": [
            "cli",
            "json"
        ]

    },

    // Define the regular expressions used to govern the siteId / connectedAppId
    "connectedAppIdRegEx": {

        // Describe the individual regExes used to clean the siteId
        "whiteSpace": /\s/g,
        "dashes": /-/g,
        "doubleUnderscore": /_+/g,
        "nonAlphaNumeric": /[^\w_]+/g,
        "alphaOnly": /[a-zA-Z]/g

    },

    // Describe the collection of available scratchOrg profiles
    "sfScratchOrg": {

        // Define he path location of all scratch-org profile paths
        "profilePath": "config-dx/b2c-{{profileName}}-scratch-def.json",

        // Default the operation mode for the application
        "defaultProfile": "base",
        "paProfile": "personaccounts",
        "defaultAlias": "b2ccrmsync",
        "setDefault": true,
        "durationDays": 7,

        // Default the acceptable collection of scratchOrg profiles
        "validProfiles": [
            "base",
            "personaccounts"
        ],

        // Default the overwrite behavior
        "forceOverwrite": true,

        // Define the properties used to seed a default b2cInstance
        "b2cInstance": {
            "description": "... development B2C Commerce instance being integrated with this scratchOrg",
            "instanceType": "Sandbox"
        },

        // Define the permission-set to assign to a given user
        "permsetName": "B2C_Integration_Tools",

        // Automatically delete scratchOrg deployment failures
        "autoDeleteFailures": true

    },

    // Represents the collection of the CLI program options that can be used across the application
    "cliOptions": {

        // Define the B2C Commerce CLI properties
        "b2cHostName": {
            "type": "b2c",
            "required": true,
            "minLength": 3,
            "cli": "-bch, --b2c-host-name <b2chostname>",
            "description": "describes the hostname / B2C Commerce environment to deploy to.",
            "envProperty": "B2C_HOSTNAME",
            "validator": "validateHostName",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cInstanceName": {
            "type": "b2c",
            "required": false,
            "minLength": 3,
            "cli": "-bcn, --b2c-instance-name <b2cinstancename>",
            "description": "describes a shorthand name for a given B2C instance.",
            "envProperty": "B2C_INSTANCENAME",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cClientId": {
            "type": "b2c",
            "required": true,
            "minLength": 3,
            "cli": "-bci, --b2c-client-id <b2cclientid>",
            "description": "describes the clientId to use to authenticate against the B2C Commerce environment.",
            "envProperty": "B2C_CLIENTID",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cClientSecret": {
            "type": "b2c",
            "required": true,
            "minLength": 3,
            "cli": "-bcs, --b2c-client-secret <b2cclientsecret>",
            "description": "describes the clientSecret to use to authenticate against the B2C Commerce environment.",
            "envProperty": "B2C_CLIENTSECRET",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cCertificatePath": {
            "type": "b2c",
            "required": false,
            "cli": "-bcp, --b2c-certificate-path <b2ccertificatepath>",
            "description": "path to the two-factor authentication certificate file.",
            "envProperty": "B2C_CERTIFICATEPATH",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cCertificatePassphrase": {
            "type": "b2c",
            "required": false,
            "cli": "-bcpa, --b2c-certificate-passphrase <b2ccertificatepassphrase>",
            "description": "describes the passphrase to use while opening the certificate for the two-factor authentication against the B2C Commerce environment.",
            "envProperty": "B2C_CERTIFICATEPASSPHRASE",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cCodeVersion": {
            "type": "b2c",
            "required": false,
            "minLength": 3,
            "cli": "-bcv, --b2c-code-version <b2ccodeversion>",
            "description": "describes the name of the code version where the connector's cartridge(s) should be deployed.",
            "envProperty": "B2C_CODEVERSION",
            "validator": "validateB2CCodeVersion",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cUsername": {
            "type": "b2c",
            "required": false,
            "minLength": 3,
            "cli": "-bcu, --b2c-username <b2cusername>",
            "description": "describes the B2C Business Manager userName that will be used to generate a BM User Grant for the OOBO use-case.",
            "envProperty": "B2C_USERNAME",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cAccessKey": {
            "type": "b2c",
            "required": false,
            "minLength": 3,
            "cli": "-bck, --b2c-access-key <b2caccesskey>",
            "description": "describes the B2C Business Manager userName access-key that will be used to generate a BM User Grant for the OOBO use-case.",
            "envProperty": "B2C_ACCESSKEY",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cDataRelease": {
            "type": "b2c",
            "required": false,
            "minLength": 3,
            "cli": "-bdr, --b2c-data-release <b2cdatarelease>",
            "description": "describes the name of the connector's b2c data-release that should be deployed.",
            "envProperty": "B2C_DATARELEASE",
            "configProperty": null,
            "defaultType": "env"
        },
        "b2cSiteIds": {
            "type": "b2c",
            "required": false,
            "minLength": 3,
            "cli": "-bsi, --b2c-site-ids <b2csiteids>",
            "description": "describes the B2C Commerce Site IDs that should be deployed to (Define as a JSON array).",
            "envProperty": "B2C_SITEIDS",
            "validator": "validateB2CSiteIDs",
            "configProperty": null,
            "defaultType": "env"
        },
        "operationMode": {
            "type": "devops",
            "required": false,
            "cli": "-om, --operation-mode <operationmode>",
            "description": "describes operation mode to follow for the current command (cli or json output).",
            "envProperty": "OPERATION_MODE",
            "configProperty": "operationMode.default",
            "defaultType": "config"
        },

        // Define the SFDX scratchOrg CLI properties
        "sfScratchOrgUsername": {
            "type": "sf",
            "required": false,
            "cli": "-sou, --sf-scratch-org-username <sfscratchorgusername>",
            "description": "describes the scratch-org username to leverage during deployment.",
            "envProperty": "SF_SCRATCHORGUSERNAME",
            "defaultType": "env"
        },
        "sfScratchOrgProfile": {
            "type": "sf",
            "required": false,
            "cli": "-sop, --sf-scratch-org-profile <sfscratchorgprofile>",
            "description": "describes the scratch-org profile to leverage when creating a scratch-org.",
            "envProperty": "SF_SCRATCHORGPROFILE",
            "configProperty": "sfScratchOrg.defaultProfile",
            "defaultType": "env"
        },
        "sfScratchOrgAlias": {
            "type": "sf",
            "required": false,
            "cli": "-soa, --sf-scratch-org-alias <sfscratchorgalias>",
            "description": "describes the alias to use for a scratch-org being created.",
            "envProperty": "SF_SCRATCHORGALIAS",
            "configProperty": "sfScratchOrg.defaultAlias",
            "defaultType": "env"
        },
        "sfScratchOrgSetDefault": {
            "type": "sf",
            "required": false,
            "cli": "-sod, --sf-scratch-org-set-default <sfscratchorgsetdefault>",
            "description": "describes the scratch-org being created should be set at the default.",
            "envProperty": "SF_SCRATCHORGSETDEFAULT",
            "configProperty": "sfScratchOrg.setDefault",
            "defaultType": "env"
        },
        "sfScratchOrgForceOverwrite": {
            "type": "sf",
            "required": false,
            "cli": "-sof, --sf-scratch-org-force-overwrite <sfscratchorgforceoverwrite>",
            "description": "describes if the current deployment should overwrite what's present in the specified scratch org.",
            "envProperty": "SF_SCRATCHORGFORCEOVERWRITE",
            "configProperty": "sfScratchOrg.forceOverwrite",
            "defaultType": "env"
        },
        "sfScratchOrgDurationDays": {
            "type": "sf",
            "required": false,
            "cli": "-soa, --sf-scratch-org-duration-days <sfscratchorgdurationdays>",
            "description": "describes the duration days to use for a scratch-org being created.",
            "envProperty": "SF_SCRATCHORGDURATIONDAYS",
            "configProperty": "sfScratchOrg.durationDays",
            "defaultType": "env"
        },

        // Define the SFDX environment properties
        "sfHostName": {
            "type": "sf",
            "required": true,
            "minLength": 3,
            "cli": "-sfh, --sf-host-name <sfhostname>",
            "description": "describes the hostname / Salesforce Platform environment to deploy to.",
            "envProperty": "SF_HOSTNAME",
            "validator": "validateHostName",
            "configProperty": null,
            "defaultType": "env"
        },
        "sfLoginUrl": {
            "type": "sf",
            "required": true,
            "minLength": 3,
            "cli": "-sfl, --sf-login-url <sfloginurl>",
            "description": "describes the login url to use to authenticate access to the specified Salesforce environment.",
            "envProperty": "SF_LOGINURL",
            "validator": "validateHostName",
            "configProperty": null,
            "defaultType": "env"
        },
        "sfUsername": {
            "type": "sf",
            "required": false,
            "minLength": 3,
            "cli": "-sfu, --sf-username <sfusername>",
            "description": "describes the userName used to authenticate against the specified Salesforce environment.",
            "envProperty": "SF_USERNAME",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "sfPassword": {
            "type": "sf",
            "required": false,
            "minLength": 3,
            "cli": "-sfp, --sf-password <sfpassword>",
            "description": "describes the password used to authenticate against the specified Salesforce environment.",
            "envProperty": "SF_PASSWORD",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "sfSecurityToken": {
            "type": "sf",
            "required": false,
            "minLength": 3,
            "cli": "-sft, --sf-security-token <sfsecuritytoken>",
            "description": "describes the security token used to authenticate against the specified Salesforce environment.",
            "envProperty": "SF_SECURITYTOKEN",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "sfConsumerKey": {
            "type": "sf",
            "required": false,
            "minLength": 3,
            "cli": "-sfk, --sf-consumer-key <sfconsumerkey>",
            "description": "describes the API key used to identify the consumer of the b2c-crm-sync connectedApp.",
            "envProperty": "SF_CONSUMERKEY",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        },
        "sfClientSecret": {
            "type": "sf",
            "required": false,
            "minLength": 3,
            "cli": "-sfs, --sf-client-secret <sfclientsecret>",
            "description": "describes the API secret used to identify the consumer of the b2c-crm-sync connectedApp.",
            "envProperty": "SF_CLIENTSECRET",
            "validator": "validateString",
            "configProperty": null,
            "defaultType": "env"
        }

    },

    // Include all configuration properties related to the validate.js library
    "validatejs": {

        // Define the minimum string length to use for validation
        "minStringLength": 3,

        // Simple placeholder used to remove validate.js's attribute name inclusion
        "attributePlaceholder": {
            attr: "--"
        }

    },

    // Centralize the CLI table schemas used to generate consistent output
    "cliTableConfig": {

        // Define the structure for scratch-org details
        "deployErrorDetails": {
            head: ["Error Property", "Current Value"],
            colWidths: [30, 88],
            colAligns: ["right", "left"]
        },

        // Define the structure for scratch-org details
        "scratchOrgDetails": {
            head: ["Org Property", "Current Value"],
            colWidths: [30, 88],
            colAligns: ["left", "left"]
        },

        // Define the structure for displaying deployment results
        "scratchOrgDeployResults": {
            head: ["State", "Type", "FilePath"],
            colWidths: [20, 20, 77],
            colAligns: ["middle", "middle", "left"]
        },

        // Define the structure for scratch-org results
        "scratchOrgResults": {
            head: ["OrgId", "UserName"],
            colWidths: [30, 88],
            colAligns: ["left", "left"]
        },

        // Define the structure for the code-version output
        "codeVersionOutput": {
            head: ["Id", "Active", "Last Modified", "CMode", "WebDAV Url"],
            colWidths: [25, 10, 20, 10, 50],
            colAligns: ["right", "middle", "middle", "middle", "left"]
        },

        // Define the structure for site output
        "siteOutput": {
            head: ["Site Identifier", "Status", "Storefront", "Site URL"],
            colWidths: [25, 10, 20, 61],
            colAligns: ["right", "middle", "middle", "left"]
        },

        // Define the structure for auth-token output
        "b2cAuthTokenOutput": {
            head: ["B2C Commerce Authentication Token"],
            colWidths: [119],
            colAligns: ["left"]
        },

        // Define the structure for the meta-data deployment output
        "dataDeploymentOutput": {
            head: ["Job ID", "Status", "Start Time", "End Time"],
            colWidths: [51, 15, 25, 25],
            colAligns: ["left", "left", "left", "left"]
        },

        // Define the structure for code-version errors
        "codeVersionErrors": {
            head: ["Code Version", "Validation Error(s) for Configured Values"],
            colWidths: [25, 93],
            colAligns: ["right", "left"]
        },

        // Define the structure for site-errors
        "siteErrors": {
            head: ["Site Identifier", "Validation Error(s) for Configured Values"],
            colWidths: [25, 93],
            colAligns: ["right", "left"]
        },

        // Define the structure for cartridge-path processing errors (additions)
        "cartridgeAddErrors": {
            head: ["Site Identifier", "Cartridge Name", "Validation Error(s) Preventing Cartridge Path Additions"],
            colWidths: [25, 20, 72],
            colAligns: ["right", "middle", "left"]
        },

        // Define the structure for cartridge-path processing errors (removals)
        "cartridgeRemoveErrors": {
            head: ["Site Identifier", "Cartridge Name", "Validation Error(s) Preventing Cartridge Path Removals"],
            colWidths: [25, 20, 72],
            colAligns: ["right", "middle", "left"]
        },

        // Define the structure for environment errors
        "cartridgePathDetails": {
            head: ["Cartridge Path Details"],
            colWidths: [119],
            colAligns: ["left"]
        },

        // Define the structure for environment errors
        "environmentErrors": {
            head: ["Env. Property Name", "Validation Error(s) for Configured Values"],
            colWidths: [25, 93],
            colAligns: ["right", "left"]
        },

        // Define the structure for displaying cartridge processing errors
        "cartridgeSummary": {
            head: ["Site Identifier", "Cartridge Name", "Processing Summary"],
            colWidths: [25, 25, 67],
            colAligns: ["right", "middle", "left"]
        },

        // Define the structure for displaying cartridge path updates
        "cartridgePathSummary": {
            head: ["Site Identifier", "Original Path", "Removed", "Updated Path"],
            colWidths: [25, 40, 11, 40],
            colAligns: ["right", "middle", "middle", "middle"]
        },

        // Define the structure for displaying path validation
        "pathsSummary": {
            head: ["Directory", "Validated", "Removed", "Created"],
            colWidths: [56, 20, 20, 20],
            colAligns: ["left", "middle", "middle", "middle"]
        },

        // Define the structure for displaying zip validation
        "zipSummary": {
            head: ["Directory", "Type", "Created"],
            colWidths: [56, 31, 30],
            colAligns: ["left", "left", "middle"]
        },

        // Define the structure for filePath output
        "filePathTable": {
            head: ["Rendered Template Path"],
            colWidths: [119],
            colAligns: ["left"]
        },

        // Define the structure for fileContents output
        "fileContentsTable": {
            head: ["Rendered Template Contents"],
            colWidths: [119],
            colAligns: ["left"]
        },

        // Define the structure for auth-token output
        "sfAuthTokenOutput": {
            head: ["Salesforce Platform Authentication Token"],
            colWidths: [119],
            colAligns: ["left"]
        }

    },

    // Include all B2C configuration properties
    "b2c": {

        // Represents the number of retries each request should process
        "retryCount": 3,

        // Represents the delay in milliseconds between retries
        "retryDelay": 1500,

        // Represents the request-timeout for B2C Commerce APIs
        "timeout":20000,

        // Define the OCAPI version number to use
        "ocapiVersion": "v20_10",

        // Define the baseUrls for account manager
        "accountManager": {
            "baseUrl": "https://account.demandware.com",
            "authUrl": "/dwsso/oauth2/access_token",
            "authorizeUrl": "/dwsso/oauth2/authorize"
        },

        // Define the cartridge deploy properties
        "cartridges": {

            // Define the minimum requirements for cartridge deployments
            "require": [

                {
                    "name": "app_storefront_base"
                }

            ],

            // Define the collection of cartridges to deploy
            "deploy": [

                {
                    "name": "int_b2ccrmsync",
                    "postBody": {
                        "name": "int_b2ccrmsync",
                        "position": "before",
                        "target": "app_storefront_base"
                    }
                },

                {
                    "name": "plugin_b2ccrmsync",
                    "postBody": {
                        "name": "plugin_b2ccrmsync",
                        "position": "before",
                        "target": "int_b2ccrmsync"
                    }
                }

            ]

        },

        // Describes the polling interval used to query job-status
        "pollingInterval": 2000,

        // Describes the total number of "unknown" status calls to accept before throwing an error
        "unknownPollingStatusThreshold": 25,

        // Describes the collection of valid job statuses that we use for polling
        "validPollingStatuses": [
            "OK",
            "PENDING",
            "RUNNING"
        ]

    },

    "messages": {

        "b2c": {

            // Define common messages related to B2C Commerce CI activities
            "cartridgeRemovedSuccessfully": "Successfully removed from the site's cartridge path",
            "cartridgeAddedSuccessfully": "Successfully added to the site's cartridge path"

        }

    },

    // Define error messages leveraged by the CI capabilities
    "errors": {

        "b2c": {

            // Define common errors related to B2C Commerce CI activities
            "badEnvironment": "Error while validating the environment, abort",
            "cannotFindMetadataArchive": "Cannot find the meta-data archive. Please run the \"crm-sync:b2c:data:zip\" command first",
            "unableToUploadMetadataArchive": "Unable to upload the meta-data archive",
            "unableToImportMetadataArchive": "Unable to import the meta-data archive",
            "cannotFindCodeArchive": "Cannot find the code archive. Please run the \"crm-sync:b2c:code:zip\" command first",
            "unableToDeployCodeArchive": "Unable to deploy the code archive",
            "cartridgeExistsInSitePath": "Cartridge already exits in this site's cartridge path",
            "cartridgeNotInSitePath": "Unable to find the required cartridge in the site's cartridge path",
            "cartridgePathMissingRequirement": "The site's cartridge path is missing a required cartridge",
            "cartridgeDoesNotExistInSitePath": "Unable to find this cartridge in the site's cartridge path",
            "noEligibleSitesForCartridgeAdds": "No sites are eligible for cartridge adds; please ensure sites have well-formed cartridge paths",
            "unableToAddSiteCartridge": "Unable to add the cartridge to the cartridge path",
            "unableToAuthenticate": "Unable to authenticate against the B2C Commerce instance; please verify your configuration properties",
            "unableToActivateCodeVersion": "Unable to activate the specified code-version; please check OCAPI permissions",
            "unableToCreateCodeVersion": "Unable to create the specified code-version; please check OCAPI permissions",
            "unableToRetrieveCodeVersion": "Unable to retrieve the specified code-version; please check OCAPI permissions",
            "unableToRetrieveCodeVersions": "Unable to retrieve B2C Commerce code-versions; please check OCAPI permissions",
            "unableToRetrieveSite": "Unable to retrieve the specified site; please check OCAPI permissions",
            "unableToVerifySites": "Unable to verify the configured sites; please check OCAPI permissions",
            "unableToVerifyCodeVersions": "Unable to verify the configured code-version; please check OCAPI permissions",
            "unableToRemoveSiteCartridge": "Unable to remove this cartridge from the site's cartridge path"

        },

        "sf": {

            // Define common errors related to Salesforce CI activities
            "badEnvironment": "Error while validating the environment, abort.",
            "unableToAuthenticate": "Unable to authenticate against the Salesforce instance; please verify your configuration properties",
            "connectedAppCredentialsParsingError": "Unable to parse the connectedApp credentials .json file; please execute 'npm run crm-sync:sf:connectedapps' to render this file"

        }

    }

};
