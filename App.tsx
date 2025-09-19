
import React, { useState, useRef, useCallback, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Controls from './components/Controls';
import Signaling from './components/Signaling';
import { ConnectionState, RecordingTarget } from './types';
import { ICE_SERVERS } from './constants';

const App: React.FC = () => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingTarget, setRecordingTarget] = useState<RecordingTarget>('local');
    const [connectionData, setConnectionData] = useState<string>('');

    const pc = useRef<RTCPeerConnection | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);

    const setupPeerConnection = useCallback(() => {
        if (pc.current) return;

        const peerConnection = new RTCPeerConnection(ICE_SERVERS);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate);
            } else {
                console.log('All ICE candidates have been gathered.');
                // When ICE gathering is complete, update the connection data with the full offer/answer
                if (pc.current?.localDescription) {
                    setConnectionData(JSON.stringify(pc.current.localDescription));
                }
            }
        };

        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState) {
                setConnectionState(peerConnection.connectionState as ConnectionState);
            }
        };

        peerConnection.ontrack = (event) => {
            const stream = event.streams[0];
            console.log('Remote track received:', stream);
            setRemoteStream(stream);
        };

        pc.current = peerConnection;
    }, []);

    const startLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setupPeerConnection();
            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream);
            });
        } catch (error) {
            console.error('Error accessing media devices.', error);
            alert('Could not access camera and microphone. Please check permissions.');
        }
    }, [setupPeerConnection]);

    const createOffer = async () => {
        if (!pc.current) return;
        try {
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            setConnectionState('connecting');
        } catch (error) {
            console.error('Error creating offer.', error);
        }
    };
    
    const handleConnectionData = async (data: string) => {
        if (!pc.current || !data) return;
        try {
            const parsedData = JSON.parse(data);
            await pc.current.setRemoteDescription(new RTCSessionDescription(parsedData));

            if (parsedData.type === 'offer') {
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
            }
            setConnectionState('connecting');
        } catch (error) {
            console.error('Error handling connection data.', error);
            alert('Invalid connection data provided.');
        }
    };

    const hangUp = () => {
        pc.current?.close();
        pc.current = null;
        localStream?.getTracks().forEach(track => track.stop());
        remoteStream?.getTracks().forEach(track => track.stop());
        screenStream?.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setRemoteStream(null);
        setScreenStream(null);
        setIsSharingScreen(false);
        setConnectionState('disconnected');
        setConnectionData('');
        if (isRecording) stopRecording();
    };
    
    const toggleScreenSharing = async () => {
        if (isSharingScreen) {
            // Stop sharing
            screenStream?.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            setIsSharingScreen(false);
            // Replace screen track with camera track
            if (pc.current && localStream) {
                const videoTrack = localStream.getVideoTracks()[0];
                const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender && videoTrack) {
                    sender.replaceTrack(videoTrack);
                }
            }
        } else {
            // Start sharing
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                setScreenStream(stream);
                setIsSharingScreen(true);
                // Replace camera track with screen track
                if (pc.current) {
                    const videoTrack = stream.getVideoTracks()[0];
                    const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    } else {
                        stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
                    }
                    // Handle when user stops sharing via browser UI
                    videoTrack.onended = () => toggleScreenSharing();
                }
            } catch (error) {
                console.error('Error sharing screen.', error);
            }
        }
    };
    
    const startRecording = () => {
        let streamToRecord: MediaStream | null = null;
        if (recordingTarget === 'local' && localStream) {
            streamToRecord = localStream;
        } else if (recordingTarget === 'remote' && remoteStream) {
            streamToRecord = remoteStream;
        } else if (recordingTarget === 'screen' && screenStream) {
            streamToRecord = screenStream;
        }

        if (streamToRecord) {
            try {
                mediaRecorder.current = new MediaRecorder(streamToRecord);
                recordedChunks.current = [];
                
                mediaRecorder.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.current.push(event.data);
                    }
                };

                mediaRecorder.current.onstop = () => {
                    const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `recording-${new Date().toISOString()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                };
                
                mediaRecorder.current.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error starting recording:", error);
                alert("Could not start recording. The selected stream may not be available.");
            }
        } else {
            alert(`Cannot start recording. The ${recordingTarget} stream is not available.`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
        }
        setIsRecording(false);
    };

    useEffect(() => {
        return () => {
            hangUp();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isCallActive = connectionState === 'connected';

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 font-sans">
            <header className="w-full text-center pb-4 border-b border-gray-700">
                <h1 className="text-4xl font-bold text-indigo-400">P2P Connect</h1>
                <p className="text-gray-400">Secure Peer-to-Peer Video, Audio, and Screen Sharing</p>
            </header>

            <main className="flex-grow flex flex-col lg:flex-row gap-4 py-4">
                <div className="flex-1 flex flex-col gap-4">
                    <VideoPlayer stream={isSharingScreen ? screenStream : localStream} muted={true} label="You" />
                    <VideoPlayer stream={remoteStream} muted={false} label="Peer" />
                </div>

                <div className="w-full lg:w-96 bg-gray-800 rounded-lg p-4 flex flex-col gap-4 shadow-lg">
                    <div className="text-center p-2 rounded-md bg-gray-700">
                        <h2 className="text-lg font-semibold">Connection Status</h2>
                        <p className={`text-xl font-bold capitalize ${isCallActive ? 'text-green-400' : 'text-yellow-400'}`}>
                            {connectionState}
                        </p>
                    </div>
                    
                    <Controls 
                        isCallActive={isCallActive}
                        isSharingScreen={isSharingScreen}
                        isRecording={isRecording}
                        hasLocalStream={!!localStream}
                        hasRemoteStream={!!remoteStream}
                        hasScreenStream={!!screenStream}
                        onStartCall={startLocalStream}
                        onHangUp={hangUp}
                        onToggleScreenShare={toggleScreenSharing}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                        recordingTarget={recordingTarget}
                        onSetRecordingTarget={setRecordingTarget}
                    />

                    {localStream && !isCallActive && (
                        <Signaling 
                            onCreateOffer={createOffer}
                            onAcceptData={handleConnectionData}
                            connectionData={connectionData}
                        />
                    )}

                </div>
            </main>
        </div>
    );
};

export default App;
