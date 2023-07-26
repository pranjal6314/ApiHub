export const nodejs = `const axios = require("axios");

const options1 = {
    method: 'POST',
    url: 'http://text-check-api.vercel.app/api/v1/text-similarity',
    data: {
      text1: 'First text',
      text2: 'Second text'
    },
    headers: {
      'Authorization': 'YOUR_API_KEY',
    }
  };
const options2 = {
    method: 'POST',
    url: 'http://text-check-api.vercel.app/api/v1/number',
    data: {
      num:any number
    },
    headers: {
      'Authorization': 'YOUR_API_KEY',
    }
  };

  const options3 = {
    method: 'GET',
    url: 'http://text-check-api.vercel.app/api/v1/realstate',
   
    headers: {
      'Authorization': 'YOUR_API_KEY',
    }
  };


  
axios.request(options).then(function (response) {
    console.log(response.data);
}).catch(function (error) {
    console.error(error);
});`

export const python = `import requests

url = 'https://similarityapi.com/api/v1/text-similarity'
api_key = 'YOUR_API_KEY'
text1 = 'First text'
text2 = 'Second text'

headers = {
    'Authorization': api_key
}

payload = {
    'text1': text1,
    'text2': text2
}

response = requests.post(url, headers=headers, json=payload)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f'Request failed with status code {response.status_code}')`