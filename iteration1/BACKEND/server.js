// File to run for starting actual Node.js server

// Setting connect variable equal to the functions made in mongo-connect.js
const connect = require('./mongo-connect')

// Establishing Express library
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// Tells local computer to listen to port 3000
// Once connection is established, connects to port and MongoDB
app.listen(PORT, () => {
    connect.connectToServer()
    console.log('Backend server is running on port: ')
    console.log(PORT)
})