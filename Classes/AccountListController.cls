public class AccountListController{
    @remoteAction
    public static List<Account> getAccountList(){
		//these are some pending changes
        return AccountListSelector.getAccountList();
    }

	public static List<Contact> getRelatedContactList(String accountId){
		// it returns List of contacts
		return AccountListSelector.getRelatedContactList(accountId);
	}
}