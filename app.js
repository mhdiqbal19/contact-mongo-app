const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const {body, validationResult, check} = require('express-validator')

const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./model/contact')
const { findOne } = require('./model/contact')

const app = express()
const port = 3000

//setup method override
app.use(methodOverride('_method'))

app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`)
})

// setup gunakan ejs
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

//configurasi flash
app.use(cookieParser('secret'))
app.use(
  session({
  cookie: { maxAge: 6000},
  secret: 'secret',
  resave: true,
  saveUnitialized: true,

})
)
app.use(flash())



app.get('/', (req, res) => {

    const mahasiswa = [
      {
        nama: 'Muhammad Iqbal',
        email: 'iqbal@gmail.com',
      },
      {
        nama: 'Zacha',
        email: 'zacha@gmail.com',
      },
      {
        nama: 'Febria',
        email: 'febri@gmail.com',
      },
    ];
  
    res.render('index', {
      layout: 'layouts/main-layout',
      nama: 'Muhammad Iqbal',
      title: 'Halaman Home',
      mahasiswa: mahasiswa,
    });
  })

  app.get('/about', (req, res) => {
    res.render('about',{
      layout: 'layouts/main-layout',
      title: 'Halaman About',
    });
  })
  
  app.get('/contact', async (req, res) => {

    const contacts = await Contact.find()
    res.render('contact',{
      layout: 'layouts/main-layout',
      title: 'Halaman Contact',
      contacts: contacts,
      msg: req.flash('msg'),
    });
  })

//halaman form tambah data contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data',
    layout: 'layouts/main-layout',
  })
})

//proses tambah data contact
app.post('/contact', [
  body('nama').custom(async (value) => {
    const duplikat = await Contact.findOne({nama: value})
    if(duplikat) {
      throw new Error('Nama contact sudah digunakan bro')
    }
    return true
  }),
  check('email', 'email koe salah bro!').isEmail(),
  check('noHp', 'No hp koe salah!').isMobilePhone('id-ID'),
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    //return res.status(400).json({errors: errors.array()})
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout',
    errors: errors.array(),
  })
  } else {
    Contact.insertMany(req.body, (error, result) => {
          //kirim flash
          req.flash('msg', 'Data berhasil ditambahkan!')
          res.redirect('/contact')
    })
  }
})

//halaman delete
app.delete('/contact', (req, res) => {
     Contact.deleteOne({nama: req.body.nama}).then((result) => {
      req.flash('msg', 'Data berhasil dihapus!')
      res.redirect('/contact')
    })
})

//form edit data contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama})
  res.render('edit-contact', {
    title: 'Form Edit Data',
    layout: 'layouts/main-layout',
    contact,
  })
})

//proses ubah data
app.put('/contact', [
  body('nama').custom(async (value, { req }) => {
    const duplikat = await Contact.findOne({nama: value})
    if(value !== req.body.oldNama && duplikat) {
      throw new Error('Nama contact sudah digunakan bro')
    }
    return true
  }),
  check('email', 'email koe salah bro!').isEmail(),
  check('noHp', 'No hp koe salah!').isMobilePhone('id-ID'),
], 
  (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
  res.render('edit-contact', {
    title: 'Form Edit Data Contact',
    layout: 'layouts/main-layout',
    errors: errors.array(),
    contact: req.body,
  })
  } else {
    Contact.updateOne({_id: req.body._id}, {
      $set: {
        nama: req.body.nama,
        email: req.body.email,
        noHp: req.body.noHp,
      }
    }).then((result) => {
      //kirim flash
      req.flash('msg', 'Data berhasil diubah!')
      res.redirect('/contact')
    })

  }
})

//halaman detail contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama})
  res.render('detail',{
    layout: 'layouts/main-layout',
    title: 'Halaman Detail Contact',
    contact,
  });
})