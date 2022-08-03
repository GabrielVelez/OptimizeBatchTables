const axios = require('axios').default

let url = "http://localhost:3333/test"

axios.get(url)
.then(function(response){
    console.log(response.data)
}).catch(function (error){
    console.log(error)
})
.then(function(){
    //Se ejecuta siempre
})


// axios.get('/user', {
//     params: {
//         ID: 12345
//     }
// })
// .then(function (response){
//     console.log(response)
// })
// .catch(function (error){
//     console.log(error)
// })
// .then(function(){
//     //Se ejecuta siempre
// })

// async function getUSer(){
//     try{
//         const response = await axios.get('/user?ID=12345')
//         console.log(response)
//     } catch(error){
//         console.error(error)
//     }
// }