
import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted: boolean;
    label: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted, label }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="bg-black rounded-lg overflow-hidden aspect-video relative flex items-center justify-center shadow-md">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                className="w-full h-full object-cover"
            />
            {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55a1 1 0 011.45.89V16.11a1 1 0 01-1.45.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <p className="text-gray-400 mt-2">{label} - No Stream</p>
                </div>
            )}
             <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                {label}
            </div>
        </div>
    );
};

export default VideoPlayer;
