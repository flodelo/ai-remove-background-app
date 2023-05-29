import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: Request) {
    // Get the request data (JSON)
    const req = await request.json();
  
    // Init the replicate object with the Replicate API token
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN as string,
    });
  
    // Set the model we run from replicate.com
    const model =
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";
  
    // Set the input image which is the image we dropped
    const input = {
      image: req.image,
    };
  
    // Run the Replicate model (to remove background) and get the result
    const output = await replicate.run(model, { input });
  
    // Check if output is NULL then return error back to the client
    if (!output) {
      console.log("Something went wrong");
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  
    // OR we show output in the console (SERVER side) and return output back to the client
    console.log("OUTPUT: ", output);
    return NextResponse.json({ output }, { status: 201 });
  }