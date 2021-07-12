
/**
 * This script is used to purge any open or pending flowInterviews.  We have to remove
 * these to delete any legacy / deactivated versions of flows.
 */

// Initialize local variables
List<FlowInterview> openFlowInterviews;

// Select the flowInterview(s) to be deleted
openFlowInterviews = [
    SELECT  Id
    FROM    FlowInterview
    WHERE   InterviewLabel LIKE '%B2C Commerce:%'
    OR      InterviewLabel LIKE '%B2CContact%'
];

// Was at least one (1) flowInterview identified?
if (openFlowInterviews.size() > 0) {

    // Delete the flowInterview(s)
    delete(openFlowInterviews);

}
