"use client";

import { useRef, useState, useEffect } from "react";
import { useQRCode } from "next-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, ShieldAlert, Check } from "lucide-react";
import jsQR from "jsqr";

interface QRCodeScannerProps {
  onScan: (result: string) => void;
}

type PermissionState = "prompt" | "granted" | "denied" | "unsupported";

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("prompt");
  const [isIOS, setIsIOS] = useState(false);
  const [hasMediaDevices, setHasMediaDevices] = useState(true);
  const [scanned_code_id, setScannedCodeId] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Check device type and permission support when component mounts
  useEffect(() => {
    // Check feature support first
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("MediaDevices API not supported in this browser");
      setHasMediaDevices(false);
      setPermissionState("unsupported");
      setScanError(
        "Camera access is not supported in this browser or context. Please try a different browser or ensure you're using HTTPS."
      );
      return;
    }

    // Check if iOS device
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    setIsIOS(checkIsIOS());

    // Check if the browser supports the Permissions API
    if (!navigator.permissions) {
      console.log("Permissions API not supported");
      setPermissionState("unsupported");
      return;
    }

    // Check camera permission status
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((permissionStatus) => {
        setPermissionState(permissionStatus.state as PermissionState);

        // Listen for permission changes
        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state as PermissionState);
        };
      })
      .catch((error) => {
        console.error("Error checking camera permission:", error);
        setPermissionState("unsupported");
      });
  }, []);

  // Function to request camera access
  const requestCameraAccess = async () => {
    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError(
        "Camera access is not supported in this browser or context. Please try a different browser or ensure you're using HTTPS."
      );
      setPermissionState("unsupported");
      setHasMediaDevices(false);
      return null;
    }

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .catch((e) => console.error("Error playing video:", e));
          }
        };
        setIsScanning(true);
        setScanError(null);
        setPermissionState("granted");
        return stream;
      }

      return null;
    } catch (error: any) {
      console.error("Error accessing camera:", error);

      // Provide specific error messages based on the error
      if (error.name === "NotAllowedError") {
        setScanError(
          "Camera access was denied. Please enable camera permissions in your browser settings."
        );
        setPermissionState("denied");
      } else if (error.name === "NotFoundError") {
        setScanError("No camera found on your device.");
      } else if (error.name === "NotReadableError") {
        setScanError("Camera is already in use by another application.");
      } else {
        setScanError(
          "Could not access camera. Please ensure camera permissions are granted."
        );
      }

      setIsScanning(false);
      return null;
    }
  };

  // Start the camera when component mounts (if permissions already granted)
  useEffect(() => {
    let videoStream: MediaStream | null = null;

    async function setupCamera() {
      // Only try to automatically start camera if permission is already granted or unsupported
      if (permissionState === "granted" || permissionState === "unsupported") {
        videoStream = await requestCameraAccess();
      }
    }

    setupCamera();

    // Cleanup function
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [permissionState]);

  // Process frames to scan for QR codes
  useEffect(() => {
    if (!isScanning) return;

    let animationFrameId: number;

    const scanQRCode = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        // Draw the current video frame to the canvas
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
          // Try again when we have enough video data
          animationFrameId = requestAnimationFrame(scanQRCode);
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR code scanning
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Use jsQR to find and decode QR codes in the image
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert", // Try normal image only, don't invert
        });

        if (qrCode) {
          console.log("QR code found:", qrCode.data);

          // Store the scanned code in the variable
          setScannedCodeId(qrCode.data);

          // Show success UI briefly
          setScanSuccess(true);

          // Call the provided callback with the result
          onScan(qrCode.data);

          // Stop scanning after successful scan
          setIsScanning(false);

          // Reset success UI after a delay
          setTimeout(() => {
            setScanSuccess(false);
          }, 2000);

          return;
        }

        // Continue scanning if no code found
        if (isScanning) {
          animationFrameId = requestAnimationFrame(scanQRCode);
        }
      } catch (error) {
        console.error("QR scanning error:", error);
        animationFrameId = requestAnimationFrame(scanQRCode);
      }
    };

    // Start scanning
    animationFrameId = requestAnimationFrame(scanQRCode);

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScanning, onScan]);

  // Render unsupported browser message if the MediaDevices API isn't available
  if (!hasMediaDevices) {
    return (
      <div className="relative w-full aspect-square flex flex-col items-center justify-center bg-gray-100 rounded-md p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Camera Access Unavailable</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your browser doesn't support camera access, or you're not using a
          secure connection (HTTPS).
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Try using a modern browser like Chrome, Safari, or Firefox on a secure
          connection.
          {isIOS &&
            " On iOS, make sure you're using Safari for best compatibility."}
        </p>
      </div>
    );
  }

  // Render permission prompt if needed
  if (permissionState === "prompt" || permissionState === "denied") {
    return (
      <div className="relative w-full aspect-square flex flex-col items-center justify-center bg-gray-100 rounded-md p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-medium mb-2">Camera Permission Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {permissionState === "denied"
            ? "Camera access was denied. Please enable camera access in your browser settings."
            : "We need camera access to scan QR codes. Your camera will only be used while the scanner is open."}
        </p>

        {isIOS && permissionState === "prompt" && (
          <p className="text-xs text-amber-600 mb-4">
            On iOS, you may need to grant camera permissions in Settings →
            Safari → Camera.
          </p>
        )}

        <Button
          className="flex items-center gap-2"
          onClick={requestCameraAccess}
        >
          <Camera className="w-4 h-4" />
          <span>Allow Camera Access</span>
        </Button>
      </div>
    );
  }

  // Show success UI if a code was just scanned
  if (scanSuccess && scanned_code_id) {
    return (
      <div className="relative w-full aspect-square flex flex-col items-center justify-center bg-green-50 rounded-md p-6 text-center">
        <div className="bg-green-100 rounded-full p-3 mb-4">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">QR Code Scanned!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Successfully scanned code:{" "}
          <span className="font-mono bg-white p-1 rounded">
            {scanned_code_id}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square">
      {scanError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-md p-4 z-10">
          <div className="text-center">
            <p className="text-red-500 text-sm mb-4">{scanError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => requestCameraAccess()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover rounded-md"
        autoPlay
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        className="hidden" // Hidden canvas for processing
      />

      <div className="absolute inset-0 border-2 border-primary border-dashed rounded-md pointer-events-none"></div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3/4 h-3/4 border-2 border-primary rounded-md"></div>
      </div>
    </div>
  );
}
