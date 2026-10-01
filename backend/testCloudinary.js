
import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

console.log("Cloud name:", process.env.CLOUDINARY_NAME)
console.log(
    "API key exists:",
    !!process.env.CLOUDINARY_API_KEY
)
console.log(
    "Secret exists:",
    !!process.env.CLOUDINARY_SECRET_KEY
)

try {
    const result = await cloudinary.uploader.upload(
        "C:/Users/Varsha/AppData/Local/Temp/hero_img.png",
        {
            resource_type: "image"
        }
    )

    console.log("================================")
    console.log("UPLOAD SUCCESS")
    console.log("================================")
    console.log("Image URL:", result.secure_url)

} catch (error) {

    console.log("================================")
    console.log("UPLOAD ERROR")
    console.log("================================")

    console.log("Message:", error.message)
    console.log("HTTP Code:", error.http_code)
    console.log("Name:", error.name)
    console.log("Error details:", error.error)

    console.log("Full error:")
    console.log(error)
}
