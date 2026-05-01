import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import Button from "~/components/Button";
import Slider from "~/components/Slider";

export default function Settings() {
  const navigate = useNavigate();
  const [musicVolume, setMusicVolume] = useState(
    () => Math.round(parseFloat(localStorage.getItem('musicVolume') ?? '0.5') * 100)
  );
  const [soundVolume, setSoundVolume] = useState(
    () => Math.round(parseFloat(localStorage.getItem('soundVolume') ?? '0.7') * 100)
  );

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sss:musicVolume', { detail: musicVolume / 100 }));
  }, [musicVolume]);

  const handleSave = () => {
    localStorage.setItem('soundVolume', String(soundVolume / 100));
    localStorage.setItem('musicVolume', String(musicVolume / 100));
    navigate('/');
  };

  return (
    <div className="settings">
      <div className="settings-content">
        <h1>Settings</h1>

        <div className="settings-row">
          <span>Music Volume</span>
          <span className="settings-pct">{musicVolume}%</span>
          <Slider value={musicVolume} onChange={setMusicVolume} />
        </div>

        <div className="settings-row">
          <span>Sound Volume</span>
          <span className="settings-pct">{soundVolume}%</span>
          <Slider value={soundVolume} onChange={setSoundVolume} />
        </div>

        <div className="settings-actions">
          <Button text="Go back" variant="underline" onClick={() => navigate('/')} />
          <Button text="Save" variant="solid" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
}
