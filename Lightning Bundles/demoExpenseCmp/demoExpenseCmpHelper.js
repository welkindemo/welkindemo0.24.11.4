({


    getExpenseList: function(component) {

        console.log("expenseListHelper.getExpenseList: entered");

        //Set the action to invoke the Apex controller method
        var action = component.get("c.getExpenses");

        //Set up the callback
        var self = this;
        action.setCallback(this, function(actionResult) {

            //Reset the value of the component list attribute with the records returned 
            component.set("v.expenses", actionResult.getReturnValue());

            //Call to the helper recalc function 
            self.recalculateTotals(component);            
            
        });

        //Enque the action
        $A.enqueueAction(action);

        console.log("expenseListHelper.getExpenseList: exit");

    },    

    //Update a record via the Apex controller
    updateExpenseItem : function(component, expense, callback) {

        console.log("expenseListHelper.updateExpenseItem: entered");

        //Setup the action to invoke a save
        var action = component.get("c.saveExpense");

        //Load the parm with the updated record 
        action.setParams({
            "expense": expense
        });

        //Set the callback if any
        if (callback) {
            action.setCallback(this, callback);
        }
       
        //Enque the action
        $A.enqueueAction(action);

        console.log("expenseListHelper.updateExpenseItem: exit");

    },

    //This method recalculates the aggregate expense totals
    recalculateTotals : function(component) {
         
        console.log("expenseListHelper.recalculateTotals: entered");
        
        //Get the expenses collection from the component
        var expenses = component.get("v.expenses");

        //Initialize working vars
        var expenseSum = 0;
        var expenseCount = 0;
        var approvedSum = 0;
        var approvedCount = 0;

        //Iterate through the expenses and calculate the totals
        for(var i = 0; i < expenses.length; i++){
           
            console.log("expenseListHelper.recalculateTotals: entered loop iteration " + i.toString());
            var e = expenses[i];

            //TODO: Substitute your org's namespace for saikatLightning.  
            expenseSum += e.saikatLightning__Amount__c;

            console.log("expenseListHelper.recalculateTotals: expenseSum=" + expenseSum);
            expenseCount ++;
            console.log("expenseListHelper.recalculateTotals: expenseCount=" + expenseCount);
           
            //Accumulate the approved expenses total ONLY if approved.

            //TODO: Substitute your org's namespace for saikatLightning.  
            if(e.saikatLightning__Approved__c) {
        
                //TODO: Substitute your org's namespace for saikatLightning.  
                approvedSum += e.saikatLightning__Amount__c;   

                console.log("expenseListHelper.recalculateTotals: approvedSum=" + approvedSum);
                approvedCount ++;
                console.log("expenseListHelper.recalculateTotals: approvedCount=" + approvedCount);
            }
     
        };

        //Set the component attribute values    
        component.set("v.expenseSum", expenseSum);
        component.set("v.expenseCount", expenseCount);  
        component.set("v.approvedSum", approvedSum);  
        component.set("v.approvedCount", approvedCount);  

        console.log("expenseListHelper.recalculateTotals: exit");

    },

})