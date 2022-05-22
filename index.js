const showList = document.getElementById('showList')
const itemList = localStorage.listRecipe ? memorySave() :  Array()

const edit = {
    editing : false,
    index : -1
}

function memorySave(){
    return JSON.parse(localStorage.listRecipe)
}   

function saveList(){
    localStorage.setItem('listRecipe', JSON.stringify(itemList.filter( i => i )))
}


function addItem(){
    const name = document.querySelector('input.name-item').value.trim()
    const units = Number(document.querySelector('input.number-units').value) || 1 
    const price = Number(document.querySelector('input.price-item').value)

    if ( name == '' || price == '' ) return alert('Por favor, complete os campos.')

    if ( edit.editing ){
        itemList[edit.index] = { name, units, price }
        objEdit(false, -1)
    } else {
        itemList.push({ name, units, price })
    }

    generateReceipt()//showItens()
    resetInput()
}

function objEdit(status, index){
    edit.editing = status
    edit.index = index
}

function resetInput(){
    document.querySelector('input.name-item').value = ''
    document.querySelector('input.number-units').value = ''
    document.querySelector('input.price-item').value = ''
}

function editItem(index){
    const item = itemList[index]
    objEdit(true, index)

    document.querySelector('input.name-item').value = item.name
    document.querySelector('input.number-units').value = item.units
    document.querySelector('input.price-item').value = item.price
}

function removeItem(index){
    delete itemList[index]
    showItens()
}

function deleteList(){
    const respost = confirm('Deseja deletar esse recibo?')

    if (respost){
        localStorage.clear()
        window.location.reload()
        return true
    } else {
        return false
    }
}

function showItens(){
    let total = 0
    let html = '<table class="table table-striped table-hover">'
    html += '<thead><tr><th>Produto</th><th>Unidade(s)</th><th>Valor</th><th>Funções</th></tr></thead><tbody>'
    for ( let i in itemList){
        const item = itemList[i]
        html += `<tr valign="middle">
                 <td>${item.name}</td><td>${item.units}</td><td>${item.price}</td>
                 <td class="td-buttons">   
                 <button class="btn-edit" onclick="editItem(${i})">Editar</button>
                 <button class="btn-edit" onclick="removeItem(${i})">Remover</button>
                 </td></tr>`

        total += item.price * item.units
    }
    html += `</tbody></table>
             <p class="margin-botton">Valor total: <b> ${formatPrice(total)} </b> (sem taxa de entrega)</p>`
    showList.innerHTML = html
    saveList()
}

function formatPrice(val){
    return Intl.NumberFormat("pt-BR", {style: 'currency', currency: 'BRL'}).format(val)
}

function generateReceipt(){
    let total = 0
    const img = '➡️'
    let html = '<div id="product-list"><p><b>Lista de pedido:</b></p>'
    html += '<ul class="item-list">'
    for ( let item of itemList ){
        if ( item != undefined ) {
            const value = item.price * item.units
            html += `<li>${img} ${item.units} ${item.name} : ${item.units} x ${item.price} = ${formatPrice(value)}</li>`
            total += value
        }
    }
    html += "</ul>"
    html += `<hr class="recipe-line"><p class="margin-botton">Valor total: *<b>${formatPrice(total)}</b>* (sem a taxa de entrega)</p></div>`
    html += '<button onclick="copyReceipt()" class="input-item">Copiar texto</button>'

    showList.innerHTML = html
    saveList()
}

function copyReceipt(){
    // generateReceipt()
    const input = document.createElement('textarea');  //Create a text area element for locate all list text
    const productList = document.getElementById("product-list");

    if (!navigator.clipboard){
        input.innerHTML = productList.innerText;
        document.body.appendChild(input);
        
        input.select(); 
        const copy = document.execCommand('copy')
        document.body.removeChild(input);
        if ( copy ) { alert('Copiado com sucesso.') }

    } else{
        navigator.clipboard.writeText(productList.innerText).then(
            function(){
                alert("Copiado com sucesso!"); // success 
            })
          .catch(
             function() {
                alert("Houve um erro! Por favor, tente novamente."); // error
          });
    }    
}

function importList(){
    showList.innerHTML = (`<div class="p-2 import-controller">
                            <h2>Importar lista</h2>
                            <input type="text" class="col-8 input-item input-text" placeholder="Insira uma lista aqui"/>
                            <button onclick="readText()" class="input-item">Ler texto</button>
                          </div>`)       
}

function readText(){
    const input_text = document.querySelector('.input-text');
    const text = input_text.value;
    const imgSeparator = '➡️'
    const textClean = text.substring(20, text.indexOf('Valor total:'))
    const textArray = textClean.split(imgSeparator);
    if ( textArray.length <= 1 ) return alert("Sem texto para importar.")
    // console.log("text array generated: ", textArray)
    generateDataArray(textArray);
}

function generateDataArray(infos){
    const response = deleteList()
    if ( !response ) return; 
    const textData = infos.map(info => itemData(info.trim().split(" "))); //info.trim())
    // console.log("text data\n",textData)
    itemList.length = 0 // clear array data
    for ( product of textData ){
        itemList.push(product)
    }
    // console.log("final:") 
    console.table(itemList)
    saveList()
}

function itemData(info){
    const units = Number(info[ 0 ].toString());
    const price = Number(info[ info.indexOf("=") - 1 ])
    const name =  info.slice(info[ info.length - 6 ].indexOf()+2, info.indexOf(":")).join(" ");
    // console.log("info:", info)
    return { name, units, price };
}