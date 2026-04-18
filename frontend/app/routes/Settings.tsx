import { useNavigate } from "react-router";
import { useState } from "react";
import Button from "~/components/Button";
import Slider from "~/components/Slider";

export default function Settings() {
  const navigate = useNavigate();
  const [musicVolume, setMusicVolume] = useState(50);
  const [soundVolume, setSoundVolume] = useState(30);

  return (
    <div className="settings">
      <div className="settings-content">
        <h1>Settings</h1>
        
        <div className="settings-row">
          <span>Music Volume</span>
          <Slider
           value={musicVolume}
           onChange={setMusicVolume}
          />
        </div>
        
        <div className="settings-row">
          <span>Sound Volume</span>
          <Slider
           value={soundVolume}
           onChange={setSoundVolume}
          />
        </div>

        <div className="settings-actions">
           <Button
            text="Go back"
            variant="underline"
            onClick={() => navigate("/")}
           />
           <Button
            text="Save"
            variant="solid"
            onClick={() => {}}
           />
        </div>
      </div>
    </div>
  );
}
