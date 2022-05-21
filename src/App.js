import React, { useEffect, useState, useRef } from "react";
import * as faceapi from 'face-api.js'


function App() {
  const [selectedFile, setSelectedFile] = useState()
  const [image, setImage] = useState();
  const imgRef = useRef();
  const canvasRef = useRef();


  const handleImage = async () => {
    const details = await faceapi
      .detectAllFaces(
        imgRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceExpressions()
    canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(imgRef.current)
    faceapi.matchDimensions(canvasRef.current, { height: image.height, width: image.width })
    const resize = faceapi.resizeResults(details, { height: image.height, width: image.width })
    faceapi.draw.drawDetections(canvasRef.current, resize)
    faceapi.draw.drawFaceExpressions(canvasRef.current, resize)

  }

  const loadModels = async () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ])
      .then(handleImage)
      .catch((e) => console.log(e))
  };


  useEffect(() => {
    const getImage = () => {
      if (!selectedFile) {
        return
      }
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      img.onload = () => {
        setImage({
          url: img.src,
          width: img.width,
          height: img.height,
        });
      };
    };
    getImage();

  }, [selectedFile])

  useEffect(() => {
    image && loadModels()
  }, [image])




  const onSelectFile = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }
    setSelectedFile(e.target.files[0])
  }



  return (
    <div style={{ display: 'flex' }}>
      {image &&
        <div style={{ display: 'flex' }}>
          <img
            ref={imgRef}
            width={image.width}
            height={image.height}
            src={image.url}
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            width={image.width}
            height={image.height}
            style={{ position: 'absolute' }}
          />
        </div>
      }
      <input
        onChange={onSelectFile}
        id="file"
        type="file"
      />
    </div>
  );
}
export default App;
