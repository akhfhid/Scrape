const axios = require("axios")
const { Jimp } = require("jimp")
const FormData = require("form-data")

class BlurFaceAPI {
    constructor() {
        this.api = null
        this.server = null
        this.taskId = null
        this.token = null
        this.width = null
        this.height = null
    }

    async init() {
        const { data: html } = await axios.get("https://www.iloveimg.com/blur-face", { timeout: 15000 })

        const token = html.match(/(ey[a-zA-Z0-9?%-_/]+)/g)?.[1]
        if (!token) throw new Error("Token not found")
        this.token = token

        const cfg = html.match(/var ilovepdfConfig = ({.*?});/s)
        if (!cfg) throw new Error("Config not found")

        const servers = JSON.parse(cfg[1]).servers
        this.server = servers[Math.floor(Math.random() * servers.length)]
        this.taskId = html.match(/taskId\s*=\s*'(\w+)/)?.[1]
        if (!this.taskId) throw new Error("Task ID not found")

        this.api = axios.create({
            baseURL: `https://${this.server}.iloveimg.com`,
            timeout: 30000,
            headers: { Authorization: `Bearer ${this.token}` }
        })
    }

    async upload(buffer, filename) {
        const { fileTypeFromBuffer } = await import("file-type")
        const type = await fileTypeFromBuffer(buffer)

        if (!type || !type.mime.startsWith("image/")) throw new Error("Invalid image type")

        const img = await Jimp.read(buffer)
        this.width = img.bitmap.width
        this.height = img.bitmap.height

        const form = new FormData()
        form.append("name", filename)
        form.append("chunk", "0")
        form.append("chunks", "1")
        form.append("task", this.taskId)
        form.append("preview", "1")
        form.append("v", "web.0")
        form.append("file", buffer, { filename, contentType: type.mime })

        const { data } = await this.api.post("/v1/upload", form, {
            headers: { ...form.getHeaders(), "Content-Length": form.getLengthSync() }
        })

        if (!data?.server_filename) throw new Error("Upload failed")
        return data.server_filename
    }

    async process(serverFilename, originalName) {
        const form = new FormData()
        form.append("task", this.taskId)
        form.append("tool", "blurfaceimage")
        form.append("mode", "include")
        form.append("level", "recommended")
        form.append("width", this.width)
        form.append("height", this.height)
        form.append("files[0][server_filename]", serverFilename)
        form.append("files[0][filename]", originalName)

        await this.api.post("/v1/process", form, {
            headers: { ...form.getHeaders(), "Content-Length": form.getLengthSync() }
        })

        const res = await this.api.get(`/v1/download/${this.taskId}`, { responseType: "arraybuffer" })
        return res.data
    }
}

async function blurFace(buffer, filename = "image.jpg") {
    const api = new BlurFaceAPI()
    await api.init()
    const serverFile = await api.upload(buffer, filename)
    return await api.process(serverFile, filename)
}

module.exports = { blurFace }
