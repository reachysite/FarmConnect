import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png"
    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif"]
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: "Invalid file extension" }, { status: 400 })
    }

    const filename = randomUUID() + "." + ext

    const uploadDir = join(process.cwd(), "public", "images", "products")
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = "/images/products/" + filename

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
