const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/wpu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})



//menambah 1 data
// const contact1 = new Contact({
//     nama: 'Dodi',
//     noHp: '1234455',
//     email: 'dodi@gmail.com',
// })

// //simpan contact1
// contact1.save().then((contact) => console.log(contact))