import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  CheckSquare,
  Settings,
  MoreHorizontal,
  PhoneOff,
  Subtitles
} from 'lucide-react';

const ControlBar = ({ isMuted, isVideoOff, isSharingScreen, isRecording, liveCaptionsEnabled, onMute, onVideo, onScreenShare, onRecord, onEndMeeting, onToggleCaptions }) => {
  
  // Simple button component
  const Button = ({ icon: Icon, label, onClick, active, colorClass = 'bg-gray-700' }) => {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-24 h-20 rounded-lg transition-colors p-2 ${
          active ? 'bg-red-600' : `${colorClass} hover:bg-gray-600`
        }`}
      >
        <Icon className="text-white mb-1" size={22} />
        <span className="text-white text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="bg-dark-card px-4 py-2 rounded-lg flex justify-center space-x-4 w-full">
      <Button
        icon={isMuted ? MicOff : Mic}
        label={isMuted ? "Unmute" : "Mute"}
        onClick={onMute}
        active={isMuted}
      />
      <Button
        icon={isVideoOff ? VideoOff : Video}
        label={isVideoOff ? "Start Cam" : "Stop Cam"}
        onClick={onVideo}
        active={isVideoOff}
      />
      <Button
        icon={Share}
        label={isSharingScreen ? "Stop Share" : "Share Screen"}
        onClick={onScreenShare}
        active={isSharingScreen}
      />
      <Button
        icon={isRecording ? VideoOff : Video}
        label={isRecording ? "Stop Rec" : "Start Rec"}
        onClick={onRecord}
        active={isRecording}
        colorClass={isRecording ? 'bg-red-600' : 'bg-gray-700'}
      />
      <Button
        icon={Subtitles}
        label={liveCaptionsEnabled ? "Hide CC" : "Show CC"}
        onClick={onToggleCaptions}
        active={liveCaptionsEnabled}
      />
      <Button
        icon={PhoneOff}
        label="End Meeting"
        colorClass="bg-red-600"
        onClick={onEndMeeting}
      />
      <Button
        icon={Settings}
        label="Settings"
        onClick={() => console.log("Settings button clicked")}
      />
      <Button
        icon={MoreHorizontal}
        label="More"
        onClick={() => console.log("More button clicked")}
      />
    </div>
  );
};

export default ControlBar;