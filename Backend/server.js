const app = require("./config/app");
const {sequelize} = require("./models/index");
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200'
}));

const port = process.env.PORT || 4000; 


(async ()=>{
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
  sequelize.sync({alter:true});
    app.listen(port, ()=>{
        console.log(`Server listening on port ${port}....`)
    })

} catch (error) {
  console.error('Unable to connect to the database:', error);
  process.exit()
}

})()
