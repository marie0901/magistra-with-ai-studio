import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    voiceId: string;
    fragmentCount: number;
  };
  onSave: (settings: { voiceId: string; fragmentCount: number }) => void;
}

const voices = [
  { id: 'Puck', name: 'Puck (Default)' },
  { id: 'Kore', name: 'Kore' },
  { id: 'Charon', name: 'Charon' },
  { id: 'Fenrir', name: 'Fenrir' },
  { id: 'Aoede', name: 'Aoede' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [voiceId, setVoiceId] = useState(settings.voiceId);
  const [fragmentCount, setFragmentCount] = useState(settings.fragmentCount);

  useEffect(() => {
    setVoiceId(settings.voiceId);
    setFragmentCount(settings.fragmentCount);
  }, [settings]);

  const handleSave = () => {
    onSave({ voiceId, fragmentCount });
    onClose();
  };

  return (
    <Modal title="Settings" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            AI Voice
          </label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {voices.map(voice => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Fragments per Session: {fragmentCount}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={fragmentCount}
            onChange={(e) => setFragmentCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>2</span>
            <span>8</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};