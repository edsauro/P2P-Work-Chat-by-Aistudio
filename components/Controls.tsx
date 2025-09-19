
import React from 'react';
import { RecordingTarget } from '../types';

interface ControlsProps {
    isCallActive: boolean;
    isSharingScreen: boolean;
    isRecording: boolean;
    hasLocalStream: boolean;
    hasRemoteStream: boolean;
    hasScreenStream: boolean;
    onStartCall: () => void;
    onHangUp: () => void;
    onToggleScreenShare: () => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    recordingTarget: RecordingTarget;
    onSetRecordingTarget: (target: RecordingTarget) => void;
}

const Button: React.FC<{ onClick: () => void; disabled?: boolean; className?: string; children: React.ReactNode }> = ({ onClick, disabled, className, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const Controls: React.FC<ControlsProps> = (props) => {
    const {
        isCallActive,
        isSharingScreen,
        isRecording,
        hasLocalStream,
        hasRemoteStream,
        hasScreenStream,
        onStartCall,
        onHangUp,
        onToggleScreenShare,
        onStartRecording,
        onStopRecording,
        recordingTarget,
        onSetRecordingTarget,
    } = props;

    const recordButtonDisabled = (!hasLocalStream && recordingTarget === 'local') || (!hasRemoteStream && recordingTarget === 'remote') || (!hasScreenStream && recordingTarget === 'screen');

    return (
        <div className="space-y-4">
            {!hasLocalStream ? (
                <Button onClick={onStartCall} className="bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    <span>Enable Camera & Mic</span>
                </Button>
            ) : (
                <Button onClick={onHangUp} className="bg-red-600 hover:bg-red-500 focus:ring-red-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    <span>Hang Up</span>
                </Button>
            )}

            <Button onClick={onToggleScreenShare} disabled={!hasLocalStream} className="bg-blue-600 hover:bg-blue-500 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                <span>{isSharingScreen ? 'Stop Sharing' : 'Share Screen'}</span>
            </Button>
            
            <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                <h3 className="text-md font-semibold text-center text-gray-300">Recording</h3>
                <div className="flex items-center space-x-2">
                    <select value={recordingTarget} onChange={(e) => onSetRecordingTarget(e.target.value as RecordingTarget)} className="w-full bg-gray-600 border border-gray-500 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="local">Record My Video</option>
                        <option value="remote">Record Peer's Video</option>
                        <option value="screen">Record Screen</option>
                    </select>
                </div>
                 {!isRecording ? (
                    <Button onClick={onStartRecording} disabled={recordButtonDisabled} className="bg-green-600 hover:bg-green-500 focus:ring-green-500">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        <span>Start Recording</span>
                    </Button>
                ) : (
                    <Button onClick={onStopRecording} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 focus:ring-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                        <span>Stop Recording</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Controls;
