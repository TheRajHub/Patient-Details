import express from "express"
import mysql from "mysql2"
import cors from "cors"
let app=express();
let port=8080||process.env.port;
let db;
try{
    db=mysql.createPool({
        host:"localhost",
        user:"root",
        password:"kaki12345",
        database:"hospital"
    }).promise();
    
}catch(e){
    console.log(e)
}
var p=0;



app.use(cors()); // Enable CORS for all routes

// Or specify the origin
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

app.get("/get/:id",async(req,res)=>{
    
    //retriving the id
    let idd=req.params.id;
    console.log(idd);
    let e={};
    try{
        //getting the name,email,prescription of the patient
        let data=await db.query("select name,email,description from prescription where id=?;",[idd]);
        e.name=data[0][0].name;
        e.email=data[0][0].email;
        e.description=data[0][0].description;
        //getting the medicine prescribed to the patent
        data=await db.query("select medicine from medicine where id in(select mid from prescrib_medicine where pid=?);",[idd]);
        e.med=[];
        for(let i=0;i<data[0].length;i++){
            
            e.med.push(data[0][i].medicine);
        }
        
        res.json(e);
        console.log(e);

    }
    catch(a){
        console.log(a);
        res.status(404).send("Wrong ID");
    }
});

app.post("/new",async(req,res)=>{
    //Getting data


    let data=req.body;
    console.log(data);


    try{
        //inserting Patient's info
        await db.query("INSERT INTO PRESCRIPTION VALUES (?,?,?,?,?)",[data.id,data.name,data.phone,data.email,data.description]);

        for(let i=0;i<data.med.length;i++){
            //selecting the id of the requested medicine
            let r=await db.query("select id from medicine where medicine=?",[data.med[i]]);
            



            //checking if it is available
            if(Object.keys(r[0]).length==0){
                p++;


                try{
                    //inserting new medicine into the database
                    await db.query("INSERT INTO MEDICINE VALUES (?,?)",[p,data.med[i]]);
                }
                catch(e){
                    console.log(e)
                }


                try{
                    //assingning medicine to the patient
                    await db.query("INSERT INTO PRESCRIB_MEDICINE VALUES (?,?)",[data.id,p]);
                }
                catch(e){
                    console.log(e)
                }
            }
            else{
                try{
                    //assingning medicine to the patient
                    await db.query("INSERT INTO PRESCRIB_MEDICINE VALUES (?,?)",[data.id,r[0].id]);
                }
                catch(e){
                    console.log(e)
                }
            }
        }
        res.json("Success");
        
    }
    catch(e){
        res.send("Wrong query..");
        console.log(e)
    }
});













app.listen(port,()=>{
    console.log(`Online..  http://localhost:${port}`)
});