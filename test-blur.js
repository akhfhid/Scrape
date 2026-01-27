const fs = require("fs")
const axios = require("axios")
const { blurFace } = require("./blur-face")

async function test() {
    try {
        console.log("Downloading sample image...")
        // Using a reliable placeholder image with a face
        const imageUrl = "https://reqres.in/img/faces/7-image.jpg"
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" })
        const buffer = Buffer.from(response.data)

        console.log("Blurring face...")
        const blurredBuffer = await blurFace(buffer, "test-image.jpg")

        fs.writeFileSync("blurred.jpg", blurredBuffer)
        console.log("Success! Saved to blurred.jpg")
    } catch (error) {
        console.error("Error:", error.message)
        if (error.response) {
            console.error("Response data:", error.response.data)
        }
    }
}

test()
