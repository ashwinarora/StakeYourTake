import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: "diba8mqrp",
    api_key: "721779383281886",
    api_secret: "LLWgNXopuKLKBw-_6PdLDvoGN2E",
});

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "stake-your-take",
                    resource_type: "auto", // allows both image & video
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        console.log(error)
                    }
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        return NextResponse.json(uploadResult);
    } catch (err) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
