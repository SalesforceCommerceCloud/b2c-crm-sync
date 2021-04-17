/**
 * @author Eric Schultz
 * @date April 16, 2020
 *
 * @description Test
 */
@IsTest
private class B2CIAProcessCustomerProfile_Test {

    @IsTest
    static void testGetCustomerProfile() {


        List<B2CIAGetCustomerProfileResult> requestArguments = new List<B2CIAGetCustomerProfileResult>();
        B2CIAGetCustomerProfileResult input = new B2CIAGetCustomerProfileResult();

        // Create a contact
        Contact c = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname'
        });

        input.crmContactId = c.Id;
        input.responseBody = '{}';
        requestArguments.add( input );


        Test.startTest();

            B2CIAProcessCustomerProfile.updateCustomerProfiles(
                requestArguments
            );

        Test.stopTest();

    }
}