({
    //Initialize the view and fetch the list of expenses on load
    doInit : function(component, event, helper) {
       
        console.log("expenseListController.doInit: entered");

        //Fetch the expense list from the Apex controller   
        helper.getExpenseList(component);

        console.log("expenseListController.doInit: exit");
    },
 
    //This is the event handler to update a record
    onUpdateExpenseEvent : function(component, event, helper) {
       
        console.log("expenseListController.onUpdateExpenseEvent: entered");
                
        //Retrieve the updated expense record from the event passed from the card
        var expense = event.getParam("expense");
        
        //Call the helper's update function.
        helper.updateExpenseItem(component, expense);

        //Call to the helper recalc function     
        helper.recalculateTotals(component);   
        
        console.log("expenseListController.onUpdateExpenseEvent: exit");
    },
   
})