/**
 * @author Eric Schultz
 * @date April 16, 2020
 *
 * @description Test
 */
@IsTest
private class B2CIAGetContact_Test {

    @IsTest
    static void testGetContact() {


        List<B2CIAGetContactInput> requestArguments = new List<B2CIAGetContactInput>();
        B2CIAGetContactInput input = new B2CIAGetContactInput();

        // Create a contact
        Contact c = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname'
        });

        input.crmContactId = c.Id;
        requestArguments.add( input );

        Test.startTest();

            List<B2CIAGetContactResult> results = B2CIAGetContact.getContact(
                requestArguments
            );

        Test.stopTest();

        System.assertEquals(
            results[0].crmContactId,
            input.crmContactId
        );

    }
}