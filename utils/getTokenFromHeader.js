export const getTokenFromHeader=(req)=>{
    const token = req?.headers?.authorization?.split(" ")[1];
    if(token==undefined){
    return "No Token Found in the header";
    }else{
        return token;
    }

}