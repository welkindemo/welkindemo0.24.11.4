public with sharing class APIService {

        //Dev
        private final static string API_END_POINT = 'http://xyz.pqr.com/salesforce/api/v1/';
        
        
        // ApproveUser endpoint
        public static HTTPResponse ApproveUser(String User_Id, String someOtherId, String someDesc) {
        
            String strQueryString = 'User_Id=' + User_Id + '&someOther_Id=' + someOtherId + '&some_Desc=' + someDesc;
            
            String strEndpoint = API_END_POINT + 'user/approve?' + strQueryString;
            
            HttpRequest req = getHTTPRequest(strEndpoint, 'POST');
            
            Http http = new Http();
            HTTPResponse res = http.send(req);
            return res;
        }
        
        
        public static HttpRequest getHTTPRequest(String strEndPoint, String strMethod) {
            HttpRequest req = new HttpRequest();
            req.setEndpoint(strEndPoint);
            req.setMethod(strMethod);
    
            return req;
        }
}