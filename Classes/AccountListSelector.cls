public class AccountListSelector{
    public static List<Account> getAccountList(){
		// returns List of account
        return [SELECT Name,CreatedDate FROM Account];
    }
	public static List<Contact> getRelatedContactList(String accountId){
        return [SELECT Name,CreatedDate FROM Contact where AccountId =: accountId];
    }
}