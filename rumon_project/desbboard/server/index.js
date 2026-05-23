import "dotenv/config"
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
const PORT = process.env.PORT || 5000
const MONGO_URl=process.env.MONGO_URl

const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect(MONGO_URl) 
.then(()=>console.log("mongoose is connected"))
.catch((error)=>{
    console.log(error.message);
    process.exit(1)
})

const employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    title: String,
    role: String,
})

const Employee = mongoose.model('Employee', employeeSchema)


// GET ALL EMPLOYEE
app.get('/employees', async (req, res) => {

    const employees = await Employee.find()

    res.json(employees)
})


// ADD EMPLOYEE
app.post('/employees', async (req, res) => {

    const newEmployee = new Employee(req.body)

    await newEmployee.save()

    res.json(newEmployee)
})


// SEARCH EMPLOYEE
app.get('/search', async (req, res) => {

    const search = req.query.name

    const result = await Employee.find({
        name: {
            $regex: search,
            $options: 'i'
        }
    })

    res.json(result)
})



app.listen(PORT,()=>{
    console.log(`Click Here http://localhost:${PORT}`);
})