console.clear();
require("dotenv").config();


const {
    Client,
    PrivateKey, 
    AccountCreateTransaction,
    AccountBalanceQuery, 
    Hbar, 
    TransferTransaction,
    AccountId,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    ContractExecuteTransaction
} = require("@hashgraph/sdk");

const fs = require("fs");



const express = require("express");
const { Http2ServerRequest } = require("http2");
const { append } = require("express/lib/response");
const App = express();
let cors = require('cors');
const { query } = require("express");
const port = 5000;
App.use(cors());
App.use(express.json());
App.use(express.urlencoded({ extended: true}));
App.use(express.static("Home-page"));

//App.use(express.static("blue-prints"));
//App.use(express.static(""));
//App.use(express.static(""));
//App.use(express.static(""));


App.get('/blue-prints', (req, res) => {
    res.sendFile('./blue-prints/blue-prints.html', {root: __dirname});
});

App.listen(port, () => {
    console.log(`now listening on port ${port}`);
});





const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
    const contractBytecode = fs.readFileSync("LookupContract_sol_LookUpContract.bin");
    // create the contract on hedera
    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(operatorKey);
    const fileCreateSubmit = await fileCreateSign.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateReceipt.fileId;
    console.log(`the bytecode file ID is: ${bytecodeFileId} \n`);

    //Instantiate the contract
    const contractInsTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters().addString("Alice").addUint256(111111))
    const contractInsSub = await contractInsTx.execute(client);
    const contractInsRec = await contractInsSub.getReceipt(client);
    const contractId = contractInsRec.contractId;
    const contractAddress =  contractId.toSolidityAddress();
    console.log(`the smart contract ID is ${contractId} \n`);
    console.log(`the smart contract ID in solidity format is: ${contractAddress} \n`);
    

    //query the smart contrasct to check changes in the sate variable
    // const contractQueryTx = new ContractCallQuery()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("getMobileNumber",new ContractFunctionParameters().addString("Alice"))
    //     .setMaxQueryPayment(new Hbar(0.1)); 
    // const contractQuerySubmit = await contractQueryTx.execute(client);
    // const contractQueryResult = contractQuerySubmit.getUint256(0);
    // console.log(`Heres the Phone number you asked for: ${contractQueryResult}`);

    //call contract function to update the state variable
    // const contractExeTx = new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("setMobileNumber", new ContractFunctionParameters().addString("Bob").addUint256(222222))
    //     .setMaxTransactionFee(new Hbar(10));
    // const contractExeSub = await contractExeTx.execute(client)
    // const contractExeRecepit = await contractExeSub.getReceipt(client);
    // console.log(`contract function call status: ${contractExeRecepit.status}`);

    //query the contract to check changes in state variable

    // const contractQueryTx1 = new ContractCallQuery()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("getMobileNumber",new ContractFunctionParameters().addString("Bob"))
    //     .setMaxQueryPayment(new Hbar(0.1)); 
    // const contractQuerySubmit1 = await contractQueryTx1.execute(client);
    // const contractQueryResult1 = contractQuerySubmit1.getUint256(0);
    // console.log(`Heres the Phone number you asked for: ${contractQueryResult1}`);    

}



//get information on the specific name requested

App.get('/getContractInfo', async (req, res) => {
    
    console.log(req.query.arg1);
    const contractQueryTx1 = new ContractCallQuery()
        .setContractId('0.0.34937953')
        .setGas(100000)
        .setFunction("getMobileNumber",new ContractFunctionParameters().addString(req.query.arg1))
        .setMaxQueryPayment(new Hbar(0.1)); 
    const contractQuerySubmit1 = await contractQueryTx1.execute(client);
    const contractQueryResult1 = contractQuerySubmit1.getUint256(0);
    console.log(`Heres the Phone number you asked for: ${contractQueryResult1}`);
    let numResult = contractQueryResult1.toNumber();
    
    if (numResult === 0 ){
        res.json({number:"N/A"})
    } else{
        res.json({number: numResult});
    }
})





//updates smart contract with user input values from the client

App.post('/PostContractInfo', async (req, res) => {

    let name = req.body.name;
    let phoneNum = req.body.phoneNum;

    const contractExeTx = new ContractExecuteTransaction()
        .setContractId('0.0.34937953')
        .setGas(100000)
        .setFunction("setMobileNumber", new ContractFunctionParameters().addString(name).addUint256(phoneNum))
        .setMaxTransactionFee(new Hbar(10));
    const contractExeSub = await contractExeTx.execute(client)
    const contractExeRecepit = await contractExeSub.getReceipt(client);
    console.log(`contract function call status: ${contractExeRecepit.status}`);

    res.json({status: contractExeRecepit.status})

})






