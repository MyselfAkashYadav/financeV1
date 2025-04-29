import arcjet,{tokenBucket} from "@arcjet/next"

const aj=arcjet({
    key:process.env.ARCJET_KEY,
    characteristics:["userId"],
    log:console,
    rules:[
        tokenBucket({
            mode: "LIVE",
            refillRate: 4, 
            interval: 3600, 
            capacity: 4, 
          }),
    ]
});


export default aj;