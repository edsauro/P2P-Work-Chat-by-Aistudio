
import React, { useState } from 'react';

interface SignalingProps {
    onCreateOffer: () => void;
    onAcceptData: (data: string) => void;
    connectionData: string;
}

const Signaling: React.FC<SignalingProps> = ({ onCreateOffer, onAcceptData, connectionData }) => {
    const [incomingData, setIncomingData] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(connectionData).then(() => {
            alert('Connection data copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="bg-gray-700 p-4 rounded-lg space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold">1. Create & Share Connection Data</h3>
                <p className="text-xs text-gray-400">Click below, then copy the generated data and send it to your peer.</p>
                <button 
                    onClick={onCreateOffer} 
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-semibold transition-colors"
                >
                    Create Connection Data
                </button>
                {connectionData && (
                    <div className="mt-2 space-y-2">
                        <textarea
                            readOnly
                            value={connectionData}
                            className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md text-xs text-gray-300 resize-none"
                            placeholder="Connection data will appear here..."
                        />
                        <button 
                            onClick={handleCopy}
                            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-semibold transition-colors"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                )}
            </div>
            
            <div className="space-y-2">
                <h3 className="font-semibold">2. Paste Peer's Connection Data</h3>
                <p className="text-xs text-gray-400">Paste the data from your peer here and click connect.</p>
                <textarea
                    value={incomingData}
                    onChange={(e) => setIncomingData(e.target.value)}
                    className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-md text-xs text-gray-300 resize-none"
                    placeholder="Paste connection data from peer..."
                />
                <button 
                    onClick={() => onAcceptData(incomingData)}
                    disabled={!incomingData}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                >
                    Connect
                </button>
            </div>
        </div>
    );
};

export default Signaling;
