@isTest
public class TestDemoController {
	static testMethod void  testDemo(){
		DemoController dc = new DemoController ();
		String retStr = dc.demoMethod();
		system.assertEquals('Its Welking Suite Demo !', retStr);
	}
}