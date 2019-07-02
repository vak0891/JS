var budgetController = (function () { // IIFE
    
    var Expense = function (id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage =  function(){
        return this.percentage;
    }

    var Income = function(id, desc, val){
        this.id= id;
        this.desc = desc;
        this.val = val;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []    
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;
        console.log("Type " + type);

        console.log(data.allItems[type]);
        data.allItems[type].forEach(function(curr){
            console.log("Value " + curr.val);
            sum += curr.val;
        });

        data.totals[type] = sum;
        console.log(sum);
    }

    return {
        addItem: function(type, desc, val){
            var newItem, ID = 0;

            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else{
                ID = 0;
            }

            // Create new item based on "exp" or "inc"
            if(type === "exp"){
                newItem = new Expense(ID, desc, val);
            }
            else if(type === "inc"){
                newItem = new Income(ID, desc, val);
            }

            // Push into data
            data.allItems[type].push(newItem);

            // return new item
            return newItem;
        },
        deleteItem: function(type, id){
            var index, ids;

            ids = data.allItems[type].map(function(current){
                return current.id;
            })
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){

           // data.totals[type] = 0;
            //Calc total income and expense, budget = income - exp; calc percentage of income we spent
           // data.allItems[type].forEach(function(){
            //data.totals[type] += val;
            //});
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0)
            {
            data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100 );    
            }
            else{
                data.percentage = -1;
            }
            console.log(data.percentage, data.budget, data.totals.inc, data.totals.exp);
        },
        calculatePercentage: function(){
            var exp_array = [];
            data.allItems['exp'].forEach(function(cur){
                if(data.totals.inc > 0 && data.budget > 0){
                    exp_array.push(Math.round((cur.val/data.totals.inc) * 100));
                }
                else{
                    exp_array.push(-1);
                }
            });
            return exp_array;
        },
        returnBudget: function(){
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        }
    };

})();

var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        totalBudget: '.budget__value',
        totalInc: '.budget__income--value',
        totalExp: '.budget__expenses--value',
        totalPercentage: '.budget__expenses--percentage',
        itemPercentage: '#exp-%id% > div.right.clearfix > div.item__percentage',
        container: '.container',
        date: '.budget__title--month'
    };

    var formatNumbers = function(number, type){
        number = Math.abs(number).toFixed(2);
        number = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //Will be either inc or exp
                desc: document.querySelector(DOMStrings.inputDesc).value,
                val: parseFloat(document.querySelector(DOMStrings.inputVal).value)
            }
        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        addListItem: function(obj, type){

            var html, newHtml, element;

            // Create placeholder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">+ %value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
            }
            else if(type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">- %value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
            }

            // Replace placeholder test with value entered
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.val, type));

            // Insert into elements
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            // Can delete only child elements
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArray;
            // returns a list to fields
            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputVal);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(curr, index, array) {
                curr.value = "";
            });

            // Bring the cursor back to desc field after clearing both desc and value. Ends up in val otherwise
            fieldsArray[0].focus();
        },
        updateBudgetUI: function(budgetVal){

            budgetVal.budget > 0 ? type = 'inc' : type = 'exp';

            //console.log(budgetVal.totalInc, budgetVal.totalExp, budgetVal.percentage, budgetVal.budget);
            document.querySelector(DOMStrings.totalBudget).textContent = formatNumbers(budgetVal.budget, type);
            document.querySelector(DOMStrings.totalInc).textContent = "+ " + formatNumbers(budgetVal.totalInc, 'inc');
            document.querySelector(DOMStrings.totalExp).textContent = "- " + formatNumbers(budgetVal.totalExp, 'exp');
            document.querySelector(DOMStrings.totalPercentage).textContent = budgetVal.percentage + "%";
            //if(budgetVal.percentage > 0){
            //document.querySelector(DOMStrings.itemPercentage).textContent = budgetVal.percentage + "%";
            //}
        },
        updatePercentageUI: function(exp_array){

            /*
            for(var i =0; i< exp_array.length; i++){
                var selector = DOMStrings.itemPercentage.replace('%id%',(i));
                console.log(selector);
                document.querySelector(selector).textContent = exp_array[i] + "%";
            }
            */

            // OR

            var exp_array_el = document.querySelectorAll('.item__percentage');
            for(var i =0 ; i< exp_array.length; i++ ){
                exp_array_el[i].textContent = exp_array[i] + "%";
            }
        },
        displayMonth: function(){
            var now = new Date();
            var  month_array = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var month = now.getMonth();
            var year = now.getFullYear();
            document.querySelector(DOMStrings.date).textContent = month_array[month-1] + " " + year + " ";
        },
        changedType: function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDesc + ',' + DOMStrings.inputVal);
            for(var i =0; i< fields.length; i++){
                fields[i].classList.toggle('red-focus');
            }
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    };
})();

var controller = (function (budgetCtrl, UICtrl) { // change name so that if we change name of controller, we dont have to change it everywhere

    // Wait for button click ot enter button press after entry
    var setUpEventListeners = function(){

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                controlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function(){
        var budgetVal;
        budgetCtrl.calculateBudget();
        //Get calculated budget
        budgetVal = budgetCtrl.returnBudget();
        //console.log(budgetVal);
        //Update UI
        UICtrl.updateBudgetUI(budgetVal);
    }

    var updatePercentage = function(){
        var exp_array = budgetCtrl.calculatePercentage();

        UICtrl.updatePercentageUI(exp_array);
    }

    // Create data structures for the values added
    var controlAddItem = function () {
        var input, item;

        // Retrieve value from the UI i.e what is entered
        input = UICtrl.getInput();
        // Add the values to the datastructure only if there is a valid entry
        if(input.desc !== "" && !isNaN(input.val) && input.val > 0){
            item = budgetCtrl.addItem(input.type, input.desc, input.val);
            // Add to UI list
            UICtrl.addListItem(item, input.type);
            // Clear and be ready for next entry
            UICtrl.clearFields();
            // Calculate new Budget
            updateBudget();
            // Update percentage
            updatePercentage();
        }
    };  

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentage();
        }
    }

    UICtrl.displayMonth();

    return{
        init: function(){
            console.log("Started");
            setUpEventListeners();
            UICtrl.updateBudgetUI({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
        }
    };

})(budgetController, UIController);

controller.init();

/* Event bubbling
When an event is triggered, it is triggered in all of the parent elements as well. All the way up DOM tree to HTML 
Element that caused the event to happen is called the target element

Event Delegation
Attach event handler to one of th eouter paremnt elements and catch it there as the event bubbles up from the original element(target element)
Use cases
When there are lots of child elements we are interested in
When the target element has not loaded yet. DOM is not available yet

DOM traversing
Move up from target element to parent element from where we want to delete
*/