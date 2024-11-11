"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";

// Direct API key usage
const API_KEY = "AIzaSyAxLRCmHcX_09pa0AOApGqvqdxvFduIgAE";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setPlantInfo(null);
      setError(null);
    }
  };

  const fileToGenerativePart = async (file) => {
    const buffer = await file.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType: file.type,
      },
    };
  };

  const identifyPlant = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      setError(null);

      const genAI = new GoogleGenerativeAI(API_KEY);
      // Updated to use the new model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt =
        "Identify this plant and provide the following information: 1. Common Name 2. Scientific Name 3. Plant Type 4. Care Requirements 5. Interesting Facts";

      const imagePart = await fileToGenerativePart(selectedImage);

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      setPlantInfo(text);
    } catch (err) {
      console.error("Error details:", err);
      if (err.message.includes("API_KEY_INVALID")) {
        setError("Invalid API key. Please check the API key configuration.");
      } else if (err.message.includes("PERMISSION_DENIED")) {
        setError(
          "API key doesn't have permission to access Gemini Vision. Please check API key permissions.",
        );
      } else {
        setError(`Failed to identify plant: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8">
          Plant Identifier
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center gap-6">
            {/* Upload Section */}
            <div className="w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-green-600">
                    <span className="font-bold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-green-500">PNG, JPG or JPEG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="relative w-full max-w-md h-64">
                <Image
                  src={preview}
                  alt="Plant preview"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            {/* Identify Button */}
            {selectedImage && !loading && (
              <button
                onClick={identifyPlant}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Identify Plant
              </button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-t-2 border-green-600 rounded-full animate-spin" />
                <p className="text-green-600">Identifying plant...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Results Section */}
            {plantInfo && (
              <div className="w-full bg-green-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">
                  Plant Information
                </h2>
                <div className="whitespace-pre-line text-green-700">
                  {plantInfo}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
