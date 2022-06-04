function getContractInfo() {
    let value = document.getElementById("lookUp");
    request = JSON.stringify(value.value);
    fetch(`http://127.0.0.1:5000/getContractInfo?arg1=${value.value}`, {method:'GET',mode:"cors"})
        .then(function(response){
            console.log(response);
            let i = response.json();
            console.log(i);
            return i;
        })
        .then(function(response){
            let obj;
            if(response.number === 'N/A'){
                obj = "No information found on this user"
            }else {
                obj = JSON.parse(response.number);
            }

            let div = document.createElement("div");
            div.textContent = `${value.value}'s Phone Number is: ${obj}`
            let parent = document.getElementById('dataContainer');
            parent.appendChild(div);
        });
}




function updateContractInfo() {
    let nameNode = document.getElementById("name");
    let name = nameNode.value;


    let phoneNumNode = document.getElementById("phoneNum");
    let phoneNum = phoneNumNode.value;

    let data = {name:name, phoneNum:phoneNum}

    let myInit = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)

    }
    console.log(myInit);
    fetch('http://127.0.0.1:5000/PostContractInfo', myInit)
        .then(function(response){
            console.log(response)
            let i = response.json()
            console.log(i)
            let div = document.createElement("div")
            let parent = document.getElementById("alert")
            if (response.status === 200) {
                div.textContent = "Success! The information was added to the ledger"
                parent.appendChild(div);
            } else {
                div.textContent = "There was an error"
                parent.appendChild(div);
            }
        })
}