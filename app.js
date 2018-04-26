var budgetController = (function(){
   
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);

        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
     var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(cur){
          sum = sum + cur.value;  
        });
        
        data.totals[type] = sum;
    }
    
    data = {
        allItems : {
            exp : [],
            inc : []
        },
        
        totals : {
            exp : 0,
            inc : 0
        },
        
        budget : 0,
        
        percentage : -1
    };
    
    return {
        addItem : function(type,des,val){
            
            var newItem, ID;
            
        
            //create new id 
            //based on the id of the last item in the array
            if(data.allItems[type].length >0){
               ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
                
            //create new item based on inc or exp type    
            if(type === 'exp'){
               newItem = new Expense(ID,des,val)
            }else if(type === 'inc'){
                newItem = new Income(ID,des,val);        
            }
            
            //push it to our data structure
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem : function(type, id){
            var ids,index;
            
            // id = 6;
            //[1,2,4,6,8]
            //index 3 
            
            var ids =  data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
               
                data.allItems[type].splice(index,1);
                
            }
            
            
        },
        
        calculateBudget : function(){
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercantages : function(){
            
            data.allItems['exp'].forEach(function(cur){
                
                cur.calculatePercentage(data.totals.inc);
                
            });
            
        },
        
        getPercentages : function(){
            
            var allPerc = data.allItems.exp.map(function(cur){
               return cur.getPercentage();
            });
            
            return allPerc;
        },
        
        getBudget : function(){
          
            return{
                budget : data.budget,
                percantage : data.percentage,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp
            }
            
        },
        
        testing : function(){
            console.log(data);
        }
    }
    
    
    
})();






var UIController = (function(){
    
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
            var splitNum, int, decimal,sign;
            
            // + or - before the number
            // 2 decimal pints
            //comma seperating thousands
            //2310.4567 --> +2,310.46
            //2000 -> 2,000.00
            
            num = Math.abs(num);
            num =  num.toFixed(2);
            
            splitNum = num.split('.');
            int = splitNum[0];
            
            
            if(int.length > 3){
            
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3); //input 23510, outpu 23,510 
                
            }
            
            
            decimal = splitNum[1];
            
            type === 'exp' ? sign = '-' : sign = '+';
            
            return sign + ' ' + int + '.'+  decimal;
        };
    
    var nodeListForEach = function(list, callback){
              
                for(var i=0; i<list.length; i++){
                    callback(list[i], i);
                }
                
            };
    
    
    return {
        getInput : function(){
            
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description :document.querySelector(DOMStrings.inputDescription).value,
                value :parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
            
        },
        
        addListItem : function(obj, type){
            var html, newHtml,element;
            
            //create HTML string with placeholder text
            
            
            if(type === 'inc'){
               
              element = DOMStrings.incomeContainer;
                
               html =   '<div class="item clearfix" id="inc-%id%">' + 
                            '<div class="item__description">%description%</div>' +
                            '<div class="right clearfix">' + 
                                '<div class="item__value">%value%</div>' +
                                '<div class="item__delete">'+
                                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                                '</div>' +
                            '</div>' +
                         '</div>';
               
               
            }else if(type === 'exp'){
                
                element =DOMStrings.expensesContainer;
                
                 html = '<div class="item clearfix" id="exp-%id%">' + 
                        '<div class="item__description">%description%</div>' +
                        '<div class="right clearfix">' + 
                            '<div class="item__value">%value%</div>' + 
                            '<div class="item__percentage">21%</div> ' +
                            '<div class="item__delete">' +
                                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                            '</div>' + 
                        '</div>' +
                    '</div>';
                
            }
            
            
            
            //Replace the placeholder text with some actual data
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            
            
            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
            
            
        },
        
        deleteListeItem : function(selectedID){
           var el = document.getElementById(selectedID);
            
            el.parentNode.removeChild(el);
        },
        
        clearFields : function(){
            
            var fields, fieldsArr;
            
            fields =  document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
            
            fieldsArr =  Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
               current.value =""; 
            });
            
            fieldsArr[0].focus();
            
        },
        
        
        displayBudget : function(obj){
           var type;    
            
           obj.budget > 0 ? type = 'inc' : type = 'exp';
            
           document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
           document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
           document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
           if(obj.percantage > 0){
            
               document.querySelector(DOMStrings.percentageLabel).textContent = obj.percantage + '%';
           }else{
               document.querySelector(DOMStrings.percentageLabel).textContent = "---"
           }
          
            
        },
        
        displayPercentages : function(percentages){
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current , index){
                if(percentages[index] > 0){
                       current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';   
                }
            })
            
        },
        
        displayMonth : function(){
          
            var year,now,month,months;
            now = new Date(); 
            year = now.getFullYear();
            month = now.getMonth();
            
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' +year;
        },
        
        
        changeType : function(){
            
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + 
                                                   DOMStrings.inputDescription + ',' + 
                                                   DOMStrings.inputValue);
            
             nodeListForEach(fields,function(cur){
                 
                 cur.classList.toggle('red-focus');
                 
             });    
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
        },
    
        getDOMStrings : function(){
            return DOMStrings;
        }
    }
    
})();


var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        
        var DOM = UICtrl.getDOMStrings();
    
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
        
            if(event.keyCode === 13 || event.which === 13){ 
                ctrlAddItem();
            }
        
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    }
    
    var updateBudget = function(){
        var budget;
        
        //calculate the budget
        budgetCtrl.calculateBudget();
        
        //return the budget
        budget = budgetCtrl.getBudget();
        
        //display the budget
        UICtrl.displayBudget(budget);
    
    }
    
    var updatePercentages = function(){
        
        //calculate percentages
        budgetCtrl.calculatePercantages();
        
        //read percentages from budget controller
         var percentages =  budgetCtrl.getPercentages();
        
        //update UI
        UICtrl.displayPercentages(percentages);
        
    }
   
    var ctrlAddItem = function(){
        var input, newItem;
        
         //get the field input data
        input  = UICtrl.getInput();
        
        if(input.description !== " " && !isNaN(input.value) && input.value>0){
        
            //add the item to budget controller
            newItem =  budgetCtrl.addItem(input.type, input.description, input.value)

            //add the item to the user interface
            UICtrl.addListItem(newItem, input.type);

            //empty fields
            UICtrl.clearFields();

            //calculate and update budget
            updateBudget();
            
            //calculate and update percentages
            updatePercentages();
  
           
        } 
    };
    
    var ctrlDeleteItem = function(event){
        
        var itemId,splitID,type, ID;
        
        itemId =   event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId){
           //inc-1
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //delete the item from data structure
            budgetCtrl.deleteItem(type,ID);
            
            //delete the item from user interface
            UICtrl.deleteListeItem(itemId);
            
            //update and show the new budget
            updateBudget();
            
            //calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init : function(){
            console.log("App started");
            setupEventListeners();
            UICtrl.displayBudget({
                budget : 0,
                percantage : -1,
                totalInc : 0,
                totalExp : 0
            });
            
            UICtrl.displayMonth();
        }
    }
    
})(budgetController, UIController);

controller.init();