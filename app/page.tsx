"use client";
import { useState } from "react";
import Dropzone, { FileRejection } from "react-dropzone";

import { FaTrashAlt, FaDownload } from "react-icons/fa";

import { ThreeDots } from "react-loader-spinner";

import { saveAs } from "file-saver";
// save file option

export default function Home() {

  const [file, setFile] = useState<File | null>();
  const [error, setError] = useState("");
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [base64image, setBase64Image] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const acceptedFileTypes = {
    "image/jpeg": [".jpeg", ".png"],
  };

  const maxFileSize = 1 * 1024 * 1024; // 5MB

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Check if any of the uploaded files are not valid
    if (rejectedFiles.length > 0) {
      console.log(rejectedFiles);
      setError("Please upload a PNG or JPEG image less than 5MB.");
      return;
    }

    handleDelete();

    console.log(acceptedFiles);
    setError("");
    setFile(acceptedFiles[0]);

    // convert image file to base64
    const reader = new FileReader();
    reader.readAsDataURL(acceptedFiles[0]);
    reader.onload = () => {
      const binaryStr = reader.result as string;
      setBase64Image(binaryStr);
    };
  };

  const fileSize = (size: number) => {
    if (size === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = () => {
    setFile(null);
    setOutputImage(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const response = await fetch("/api/replicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64image }),
    });

    let result = await response.json();
    console.log(result);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOutputImage(result.output);
    setLoading(false);
  };

  const handleDownload = () => {
    saveAs(outputImage as string, "output.png");
  };

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      {/* Header */}
      <section className="text-center mb-10">
        <h1 className="font-semibold text-transparent text-6xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block bg-clip-text">
          Remove background
        </h1>
      </section>

      {/* Upload section */}
      <section className="w-full max-w-lg mx-auto mb-12">
        {
          /* Upload area (dropzone-react) */
        }
        <div className="w-full p-10 text-center border-4 border-gray-500 border-dashed rounded-md cursor-pointer mb-2 text-gray-500">
          <Dropzone
            accept={acceptedFileTypes}
            multiple={false}
            maxSize={maxFileSize}
            onDrop={onDrop}
          >
            {({ getRootProps, getInputProps }) => (
              <section>
                <div className="p-10" {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag & drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>

        {error && (
          <div className="flex justify-center">
            <p className="text-md text-yellow-500">{error}</p>
          </div>
        )}

        {
          /* Submit button */
        }
        {
          file && (
            <div className="flex items-center justify-center mt-2">
              <button
                onClick={handleSubmit}
                className="text-white text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l rounded-lg px-4 py-2 text-center mb-2">
                Remove background
              </button>
            </div>)}

      </section>

      {
        /* Images section */
      }
      <section className="grid grid-cols-2 gap-4 mt-4">
        {file && (
          <>
            <div className="relative">
              <img
                src={URL.createObjectURL(file)}
                // method from react-dropzone (https://react-dropzone.js.org/)
                alt={file.name}
                className="object-cover w-full h-full"
              />
              <button
                className="absolute top-0 right-0 p-3 text-black bg-red-500"
                onClick={() => handleDelete()}
              >
                <FaTrashAlt className="w-4 h-4 hover:scale-125 duration-300" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 text-white text-md p-2">
                {file.name} ({fileSize(file.size)})
              </div>
            </div>
            <div className="flex items-center justify-center text-white relative">

              {
                loading && (
                  <ThreeDots
                    height="60"
                    width="60"
                    color="#eeeeee"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                )}

              {outputImage && (
                <>
                  <img
                    src={outputImage}
                    alt="output"
                    className="object-cover w-full h-full"
                  />

                  <button
                    className="absolute top-0 right-0 p-3 text-black bg-green-500"
                    onClick={() => handleDownload()}
                  >
                    <FaDownload className="w-4 h-4 hover:scale-125 duration-300" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </section>;

    </div>
  )
}
