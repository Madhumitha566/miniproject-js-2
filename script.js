//DOM selector
const Income=document.getElementById('total-Income')
const Expense=document.getElementById('total-expense')
const Balance=document.getElementById('total-balance')
const FormInput=document.getElementById('transactionform')

//Button DOM
const addtrans=document.getElementById('submit-btn')
const resetbtn=document.getElementById('resetbtn')

//Transaction history DOM
const hiddendata=document.getElementById('data-empty')
const translist=document.getElementById('transaction-list')

//form input
const typeInput=document.getElementById('type')
const descriptionInput=document.getElementById('description')
const amountInput=document.getElementById('amount')

//set variables
let transactions=JSON.parse(localStorage.getItem('transactions'))||[]
let editId=false
let currentedit=null

//save to local stroage
const saveToLocalStorage=()=>{
    localStorage.setItem('transactions',JSON.stringify(transactions))
}

//number input to formatted currency
const formatCurrency=(amount)=>{
    return new Intl.NumberFormat('en-US',{
        style:'currency',
        currency:'USD'
    }).format(amount)
};

//renders for choose only one choice at a time
const rendersvalue=()=>{
    const filter=document.querySelector('input[name="filter"]:checked').value;
    const filteredvalue=transactions.filter(t=>{
     if(filter==='all') return true;
       return t.type===filter;
    })
    translist.innerHTML = '';
     if(filteredvalue.length===0){
       hiddendata.classList.remove('hidden')   
     }
     else{
      hiddendata.classList.add('hidden')
     }

//create the list for transaction data
  filteredvalue.forEach(transaction=>{
    const listitems=document.createElement('li')
    listitems.className=`transaction-item ${transaction.type}`
    listitems.dataset.id=transaction.id

    const amountsign= transaction.type === 'expense' ? '-':'+'
    const formatamount= formatCurrency(transaction.amount)

    listitems.innerHTML=`
    <div class="item-details">
            <span class="item-des">${transaction.description} </span>
            <span class="item-date">${new Date(transaction.date).toLocaleDateString()}</span>
    </div>
    <div class="item-amount">
          <span>${amountsign}${formatamount}</span>
    </div>
    <div class="btn-fun">
        <button class="action-btn edit-btn" id="update-btn" onclick="editEntry(${transaction.id})">Edit</button>
        <button class="action-btn del-btn" id="delete-btn" onclick="deleteEntry(${transaction.id})">Delete</button>
    </div>
    `
   
    translist.appendChild(listitems)
})
   
  Updatelogic();
};

//calculating the income,expense,netbalance

const Updatelogic=()=>{
    const totalIncome=transactions
    .filter(t=>t.type==='income')
    .reduce((sum,t)=>sum+t.amount,0)

    const totalexpense=transactions
    .filter(t=>t.type==='expense')
    .reduce((sum,t)=>sum+t.amount,0)

    const netbalance=totalIncome-totalexpense

    Income.textContent = formatCurrency(totalIncome);
    Expense.textContent = formatCurrency(totalexpense);
    Balance.textContent = formatCurrency(netbalance);

    Balance.parentElement.className='card net-balance-card'
    if(netbalance<0){
        Balance.parentElement.classList.add('negative-balance')
    }
    else{
        Balance.parentElement.classList.remove('negative-balance')
    }

}

//handle the submission

const handlesubmitbtn=(e)=>{
    e.preventDefault()
    const type=typeInput.value
    const description=descriptionInput.value.trim()
    const amount=parseFloat(amountInput.value)
 
   // basic validation
    if(!description || amount<=0 ||isNaN(amount)){
        alert('please enter a valid description and amount must be greater than zero')
        return
    }

    //update logic

    if(editId){
         const index=transactions.findIndex(t=>t.id===currentedit)
        if(index!==-1){
            transactions[index].type=type
            transactions[index].description=description
            transactions[index].amount=amount
        }
        //reset the value
        editId=false
        currentedit=null
        addtrans.textContent= 'Add Transaction'
        addtrans.classList.remove('update-mode')
    }
    //new transaction

    else{
        const newtransaction={
            id:Date.now(),
            type,
            description,
            amount,
            date:new Date().toISOString(),
        }
        transactions.push(newtransaction)
    }
   saveToLocalStorage()
   rendersvalue()
   resetForm()
}

//update each element

const editEntry=(id)=>{
       const  transaction=transactions.find(t=>t.id===id)
       if(!transaction)return
       //change the state
       editId=true
       currentedit=id
      
       //changing the value from input field to update fields
       typeInput.value=transaction.type
       descriptionInput.value=transaction.description
       amountInput.value=transaction.amount.toFixed(2)

       //text changes for update
      addtrans.textContent='Save Changes';
      addtrans.classList.add('update-mode')

      //scroll for better things
      FormInput.scrollIntoView({behavior:"smooth"})
}

//delete the transaction
 
const deleteEntry=(id)=>{
    if(confirm('Are you sure you want to delete this transaction?')){
        transactions=transactions.filter(t=>t.id!==id)
        saveToLocalStorage()
        rendersvalue()
    }
    if(currentedit===id){
        resetForm()
    }
}

//clearing the form fields

const resetForm=()=>{
    FormInput.reset()
    editId=false
    currentedit=null
    addtrans.textContent=('Add Transaction')
    addtrans.classList.remove('update-mode')
}

//eventlistener fields

 //submit-btn
FormInput.addEventListener('submit',handlesubmitbtn)

//reset-btn
 resetbtn.addEventListener('click',resetForm)

 //radio input
 document.querySelectorAll('input[name="filter"]').forEach(radio=>{
    radio.addEventListener('change',rendersvalue);
 })

 //content loaded
 document.addEventListener('DOMContentLoaded',rendersvalue)



