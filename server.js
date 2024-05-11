import app from "./app/app.js"
import http from "http";



const server=http.createServer(app);

const PORT= process.env.PORT || 7000;
server.listen(PORT,()=>{
    console.log(`Server is Running on ${PORT}`);
})
