//server file where everything is started
const mongoose = require('mongoose');

const dotenv = require('dotenv'); // pakai package env utk mudah access environmanet variables

// nak access file config
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE_LOCAL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// initalize connection
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: true
//   })
//   .then(() => console.log('Connected to database'));
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB Connected...');
  })
  .catch(err => console.log(err));

//save data into collection
// const testTour = new Tour({
//   name: 'test',
//   rating: 4.7,
//   price: 497
// });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log(err);
//   });

// console.log(app.get('env')); // will get environment variable
// console.log(process.env); // kalau nak tgk environamnet apa lagy yang ada
//console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // xnak directly exit the server
  // nk bagi semuaoperation exec dlu baru shutdown
  server.close(() => {
    process.exit(1);
  });
});
