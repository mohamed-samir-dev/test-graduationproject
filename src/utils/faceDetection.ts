interface FaceDetectionResponse {
  success: boolean;
  face_detected?: boolean;
  error_type?: 'no_face' | 'multiple_faces';
  message?: string;
  face_count: number;
}

export async function detectFace(imageData: string): Promise<FaceDetectionResponse> {
  const response = await fetch("http://localhost:5000/detect_face", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      image: imageData
    })
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
}