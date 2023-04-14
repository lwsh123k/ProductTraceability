import "../style/app.css";
import Web3 from 'web3';
import CryptoJS from 'crypto-js';
import ProductArtifact from "../../../build/contracts/ProductTraceability.json";

const App = {
  web3: null,
  account: null,
  ProductContract: null,
  
  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ProductArtifact.networks[networkId];
      this.ProductContract = new web3.eth.Contract(
        ProductArtifact.abi,
        deployedNetwork.address,
      );
      
      // console.log(this.ProductContract);
      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  addNewProduct: async function()
  {
    const {addProduct} = this.ProductContract.methods;

    let batchNumber = document.getElementById("batchNumber").value;
    let name = document.getElementById("name").value;
    let manufacturer = document.getElementById("manufacturer").value;
    let productionDate = document.getElementById("productionDate").value;
    let productionTimestamp = new Date(productionDate).getTime();   //转换为时间戳
    let secret = document.getElementById("secret").value;
    let passPhrase = document.getElementById("passPhrase").value;
    let encryptedSecret = CryptoJS.AES.encrypt(secret,passPhrase).toString();
    let imgHash = await this.computeHash();  // 计算图片hash
    addProduct(name, manufacturer, productionTimestamp, batchNumber, imgHash, encryptedSecret).send(
      { from: this.account, gas: '1000000' }, 
      function(error, transactionHash){
        console.log(error);
      }
    );
    document.getElementById("batchNumber").value = "";
    document.getElementById("name").value = "";
    document.getElementById("manufacturer").value = "";
    document.getElementById("productionDate").value = "";
    document.getElementById("secret").value = "";
    document.getElementById("passPhrase").value = "";
  },

  getProductInfo: function()
  {
    const {getProduct} = this.ProductContract.methods;

    let passPhrase = document.getElementById("passPhrase").value;
    let batchNumber = document.getElementById("batchNumber").value;

    // 根据batch-number从服务器获取图片
    /* fetch(`http://localhost:3000/images/${batchNumber}.png`, {
      method: 'GET',
      mode: 'no-cors'
    }).then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          // 将DataURL设置为<img>标签的src属性值
          const productDisplay = document.getElementById('productDisplay');
          productDisplay.src = reader.result;
        };
        reader.readAsDataURL(blob);
      }).catch(error => {
        console.log(error);
      }); */
    
      const productDisplay = document.getElementById('productDisplay');
      productDisplay.src = `http://localhost:3000/images/${batchNumber}.png`;

    document.getElementById("textArea").value = "该商品的信息如下:";
    getProduct(batchNumber).call().then( function(result){
      let encryptedSecret = result[5];
      let decryptedSecret;
      if(passPhrase === '')
        decryptedSecret  = '*****';
      else
        decryptedSecret = CryptoJS.AES.decrypt(encryptedSecret, passPhrase).toString(CryptoJS.enc.Utf8);
      let info = "\n\n商品名称:" + result[0] + "\n生产厂商:" + result[1] + 
                  "\n生产日期:" + timeToString(new Date(parseInt(result[2]))) + 
                  "\n图片hash:" + result[3] +
                  "\n保密信息:" + decryptedSecret + 
                  "\n操作时间:" + timeToString(new Date(parseInt(result[6] * 1000)));
      document.getElementById("textArea").value += info;
    });
    
    /* getProduct(batchNumber).call( function (error, result){
      console.log(result);
      let encryptedSecret = result[4];
      let decryptedSecret = CryptoJS.AES.decrypt(encryptedSecret, passPhrase).toString(CryptoJS.enc.Utf8);
      let info = "\n\n商品名称:" + result[0] + "\n生产厂商:" + result[1] + 
                  "\n生产日期:" + result[2] + "\n查看次数:" + result[3]
                  "\t保密信息:" + decryptedSecret + "\n操作者:" + result[5];
      document.getElementById("textArea").value += info;
    }) */
  },

  computeHash: async function() {
    const imageUpload = document.getElementById('productImage');
    const file = imageUpload.files[0];

    // 读取文件内容
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    // 计算文件哈希值
    const buffer = await new Promise((resolve) => {
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
    });
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(hashHex);
    return hashHex;
  }
};

//定义将Date对象转换为字符串函数
function timeToString(timeObj){
  var str = "";
  var year = timeObj.getFullYear();
  var month = timeObj.getMonth() + 1;
  var date = timeObj.getDate();
  str = year+"-"+month+"-"+date;
  return str;
}

// 处理图片
function uploadImage() {
  let imgHash;
  const imageUpload = document.getElementById('productImage');

  imageUpload.addEventListener('change', async () => {
    const file = imageUpload.files[0];
    // 上传图片和哈希值到服务器
    const formData = new FormData();
    let batchNumber = document.getElementById("batchNumber").value;
    formData.append('image', file);
    formData.append('batchNumber', batchNumber);
    await fetch('http://localhost:3000/upload', {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
  });
}
window.App = App;

window.addEventListener('load', function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    // 连接到本地模拟的区块链
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );
    // 添加处理图片流程
    uploadImage();
  }

  App.start();
});
