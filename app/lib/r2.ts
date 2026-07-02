import { S3Client } from "@aws-sdk/client-s3";

if(!process.env.R2_ACCESS_KEY_ID){
    console.log("R2_ACCESS_KEY_ID is not defined");
}

export const r2Client = new S3Client({
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    }
})