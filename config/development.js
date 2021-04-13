module.exports = {

    // Create a namespace for all test-data related constants
    "unitTests": {

        // Define if data-deletion
        "deleteDataOnTearDown": true,

        // Define the invalid operation mode to test with
        "invalidOperationMode": "foo",

        // Define the collection of
        "cliOutputValidationAttributes": {

            // Define the collection of environment definition properties to validate
            "getEnvironment": {
                "b2cHostName": true,
                "b2cInstanceName": true,
                "b2cClientId": true,
                "b2cClientSecret": true,
                "b2cCodeVersion": true,
                "b2cSiteIds": true,
                "b2cDataRelease": true
            },

            // Define the collection of site-validation properties to validate
            "verifySites": {
                "siteId": true,
                "status": true,
                "statusText": true,
                "url": true,
                "version": true
            },

            // Define the collection of codeVersion-validation properties to validate
            "verifyCodeVersion": {
                "id": true,
                "active": true,
                "rollback": true,
                "compatibilityMode": true,
                "webDavUrl": true,
                "lastModificationTime": true
            }

        },

        // Define test data-sets leveraged by unit tests
        "testData": {

            // Define the default accountName to use
            "defaultAccountName": "Unknown Customer",

            // Define the personAccount recordType developerName
            "personAccountDeveloperName": "PersonAccount",

            // Define the API Version to leverage
            "sfdcAPIVersion": "v50.0",

            // Default the test sandbox url for mocks / unit-tests
            "b2cBaseUrl": "https://mock.sandbox.us01.dx.commercecloud.salesforce.com",

            // Default the test customerId value to leverage
            "b2cTestCustomerIdValue": "CUSTOMERID-001",
            "b2cTestCustomerNoValue": "0123456789",

            // Describe the default customerList for testing
            "b2cCustomerList": "RefArch",

            // Describe the relationship between sites / customer-lists
            "b2cSiteCustomerLists": {

                // Map sites to their customer-list
                "RefArch": "RefArch",
                "RefArchGlobal": "RefArchGlobal"

            },

            "codeVersions": [
                {
                    "_type": "code_version",
                    "activation_time": "2020-12-16T17:14:11Z",
                    "active": true,
                    "cartridges": [
                        "app_storefront_base",
                        "bm_app_storefront_base",
                        "lib_productlist",
                        "modules",
                        "plugin_applepay",
                        "plugin_cartridge_merge",
                        "plugin_datadownload",
                        "plugin_giftregistry",
                        "plugin_instorepickup",
                        "plugin_productcompare",
                        "plugin_sitemap",
                        "plugin_wishlists"
                    ],
                    "compatibility_mode": "19.10",
                    "id": "SFRA_510",
                    "last_modification_time": "2020-12-16T17:14:11Z",
                    "rollback": false,
                    "web_dav_url": "/on/demandware.servlet/webdav/Sites/Cartridges/SFRA_510"
                },
                {
                    "_type": "code_version",
                    "active": false,
                    "compatibility_mode": "19.10",
                    "id": "version1",
                    "last_modification_time": "2020-12-16T13:51:46Z",
                    "rollback": true,
                    "web_dav_url": "/on/demandware.servlet/webdav/Sites/Cartridges/version1"
                }

            ],

            // Define the customer profiles used for e2e live-tests
            "profileTemplate": {
                "password":"P@ssw0rd!",
                "customer": {
                    "login": "e2e-user@qa.crmsync.salesforce.com",
                    "email":"e2e-user@qa.crmsync.salesforce.com",
                    "first_name":"End-to-End",
                    "last_name":"Testing User"
                }
            },

            // Define the update-template attributes for the profileTemplate
            "updateTemplate": {
                "job_title": "Marvel Trailer Easter Egg Reviewer",
                "phone_home": "555-555-1212"
            },

            // Define the template used to reset the update-template fields
            "resetTemplate": {
                "_delete": [
                    "job_title",
                    "phone_home"
                ]
            },

            // Define the template used to reset SFDX properties in B2C Commerce
            "resetSFDXTemplate": {
                "delete": [
                    "b2ccrm_accountId",
                    "b2ccrm_contactId",
                    "b2ccrm_syncStatus",
                    "b2ccrm_syncResponseText"
                ]
            },

            // Describe the preference group to leverage
            "crmSyncSitePreferenceGroup": "B2CCRMSync",

            // Define the template used to reset SFDX properties in B2C Commerce
            "crmSyncSitePreferences": [
                "c_b2ccrm_syncCustomersEnabled",
                "c_b2ccrm_syncCustomersOnLoginEnabled",
                "c_b2ccrm_syncCustomersOnLoginOnceEnabled",
                "c_b2ccrm_syncCustomersViaOCAPI",
                "c_b2ccrm_syncIsEnabled"
            ],

            // Define the collection of contact properties to return via findQueries
            "contactFieldMap": {
                Id: 1,
                AccountId: 1,
                B2C_CustomerList__c: 1,
                B2C_Customer_ID__c: 1,
                B2C_Customer_No__c: 1,
                B2C_CustomerList_ID__c: 1,
                FirstName: 1,
                LastName: 1,
                Email: 1
            },

            // Define the collection of account properties to return via findQueries
            "accountFieldMap": {
                Id: 1,
                Name: 1,
                RecordTypeId: 1
            }

        },

        // Define the sample command.opts() object leveraged by environment unit-tests
        "opts": {

            // Use this as the default configuration for success scenarios
            "default": {
                "b2cHostName": "sandbox.us01.dx.commercecloud.salesforce.com",
                "b2cClientId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cClientSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArch","RefArchGlobal"],
                "b2cCodeVersion": "scc_210",
                "b2cDataRelease": "scc-sample-orders"
            },

            // Use this as the default configuration for configuration-based failure scenarios
            "missingHostName": {
                "b2cClientId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cClientSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArch","RefArchGlobal"],
                "b2cCodeVersion": "scc_210",
                "b2cDataRelease": "scc-sample-orders"
            },

            // Use this as the default configuration for missing clientIds
            "missingClientId": {
                "b2cHostName": "sandbox.us01.dx.commercecloud.salesforce.com",
                "b2cClientSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArch","RefArchGlobal"],
                "b2cCodeVersion": "scc_210",
                "b2cDataRelease": "scc-sample-orders"
            },

            // Use this as the default configuration for missing clientSecrets
            "missingClientSecret": {
                "b2cHostName": "sandbox.us01.dx.commercecloud.salesforce.com",
                "b2cClientId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArch","RefArchGlobal"],
                "b2cCodeVersion": "scc_210",
                "b2cDataRelease": "scc-sample-orders"
            },

            // Use this to test a configuration where one site is invalid
            // Including "invalid" in the siteId automatically triggers the generation
            // of a 400 error in our mock OCAPI REST API responses
            "invalidSite": {
                "b2cHostName": "sandbox.us01.dx.commercecloud.salesforce.com",
                "b2cClientId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cClientSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArch","RefArchInvalid"],
                "b2cCodeVersion": "scc_210",
                "b2cDataRelease": "scc-sample-orders"
            },

            // Use this to validate the edge-case of all site being invalid
            // This should throw an async error (evaluate if it's necessary)
            "invalidSites": {
                "b2cHostName": "sandbox.us01.dx.commercecloud.salesforce.com",
                "b2cClientId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cClientSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArchInvalid","RefArchGlobalInvalid"],
                "b2cCodeVersion": "scc_210",
                "b2cDataRelease": "scc-sample-orders"
            },

            // Use this to validate the edge-case a code-version that cannot be verified
            "missingCodeVersion": {
                "b2cHostName": "sandbox.us01.dx.commercecloud.salesforce.com",
                "b2cClientId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cClientSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "b2cSiteIds": ["RefArch","RefArchGlobal"],
                "b2cCodeVersion": "scc_210_Invalid",
                "b2cDataRelease": "scc-sample-orders"
            }

        },

        // Define the baseline environment (mimicking the contents of the .env file)
        "baselineEnvironment": {
            "B2C_HOSTNAME": "sandbox.us01.dx.commercecloud.salesforce.com",
            "B2C_CLIENTID": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "B2C_CLIENTSECRET": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "B2C_SITEIDS": "RefArch, RefArchGlobal",
            "B2C_CODEVERSION": "scc_v210",
            "B2C_DATARELEASE": "scc-sampledata"
        },

        // Define the baseline environment (mimicking the contents of the .env file)
        "dotEnvironments": {

            // Use this information for all baseline success tests
            "default": [
                "B2C_HOSTNAME=sandbox.us01.dx.commercecloud.salesforce.com\n",
                "B2C_CLIENTID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n",
                "B2C_CLIENTSECRET=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n",
                "B2C_SITEIDS=RefArch, RefArchGlobal\n",
                "B2C_CODEVERSION=scc_v210\n",
                "B2C_DATARELEASE=scc-sampledata\n"
            ],

            // Use this environment to cause test-failures that are configuration-driven
            "missingHostName": [
                "B2C_CLIENTID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n",
                "B2C_CLIENTSECRET=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n",
                "B2C_SITEIDS=RefArch, RefArchGlobal\n",
                "B2C_CODEVERSION=scc_v210\n",
                "B2C_DATARELEASE=scc-sampledata\n"
            ]

        },

        // Describe which existing cliOptions should be used to test optionDefaults
        "cliOptionDefaultTestValues": {
            "envDefaultOption": "b2cHostName",
            "configDefaultOption": "operationMode"
        }

    },

    // Describe the collection of nock properties used to drive mock network requests
    "nockProperties": {

        // Define all Account Manager mock-request / response properties
        "accountManager": {

            // Define the success properties
            "accessToken": "success-OiJKV1QiLCJraWQiOiJEMWhPUDdEODN4TjBqZWlqaTI3WWFvZFRjL0E9Iiwi",
            "scope": "mail tenantFilter profile roles",
            "tokenType": "Bearer",
            "expiresIn": 1799,

            // Define the failure properties
            "authErrorDescription": "Client ID in request does not match authenticated client",
            "authError": "invalid_client"

        },

        // Define all shop guest-authorization mock-request / response properties
        "shopGuestAuth": {

            // Define the success properties
            "authVersion": "20.9",
            "authGrantType": "customer",
            "authType": "guest",
            "authCustomerId": "ab2z7VqXy7NJUCI5sSFs7J76Kd",
            "authPreferredLocale": "en_US",

            // Define the failure properties
            "authErrorType": "SiteNotFoundException",
            "authErrorMessage": "No site with the specified SiteID was found."

        },

        // Define all B2C Commerce mock-request / response properties
        "b2c": {

            "ocapi": {

                // Default the OCAPI test version number
                "version": "v20_9",

                // Default the site(s) to test with
                "siteId": "RefArch",
                "invalidSiteId": "UnknownSite",

                "shop": {

                    "auth": {

                        // Default the ocapi shop API url to guest-auth against
                        "guest": "/s/__site__/dw/shop/__vn__/customers/auth"

                    }

                },

                "data": {

                    "codeVersions": {

                        // Default the ocapi Data API url to retrieve codeVersion data
                        "getUrl": "/s/-/dw/data/__vn__/code_versions"

                    },

                    "sites": {

                        // Default the ocapi Data API url to retrieve site data
                        "getUrl": "/s/-/dw/data/__vn__/sites"

                    }

                }

            }

        }

    }

}
