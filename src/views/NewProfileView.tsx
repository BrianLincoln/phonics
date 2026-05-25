import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATAR_EMOJIS, AVATAR_COLORS } from '../store/profiles';
import { useProfile } from '../context/ProfileContext';
import './NewProfileView.css';

type Step = 'name' | 'avatar';

export function NewProfileView() {
  const navigate = useNavigate();
  const { addProfile, selectProfile } = useProfile();

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].value);

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 1) return;
    setStep('avatar');
  }

  async function handleCreate() {
    const profile = await addProfile(name, selectedEmoji, selectedColor);
    selectProfile(profile);
    navigate('/menu');
  }

  return (
    <div className="new-profile">
      {step === 'name' && (
        <form className="new-profile__step" onSubmit={handleNameSubmit}>
          <h1 className="new-profile__title">What's your name?</h1>
          <input
            className="new-profile__name-input"
            type="text"
            placeholder="Type your name..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button
            className="new-profile__btn"
            type="submit"
            disabled={name.trim().length < 1}
          >
            Next
          </button>
          <button
            className="new-profile__back"
            type="button"
            onClick={() => navigate('/')}
          >
            Back
          </button>
        </form>
      )}

      {step === 'avatar' && (
        <div className="new-profile__step">
          <h1 className="new-profile__title">Pick your character, {name}!</h1>

          <div
            className="new-profile__preview"
            style={{ backgroundColor: selectedColor }}
          >
            {selectedEmoji}
          </div>

          <section className="new-profile__section">
            <h2 className="new-profile__section-label">Character</h2>
            <div className="new-profile__emoji-grid">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`new-profile__emoji-btn${selectedEmoji === emoji ? ' new-profile__emoji-btn--selected' : ''}`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </section>

          <section className="new-profile__section">
            <h2 className="new-profile__section-label">Color</h2>
            <div className="new-profile__color-grid">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`new-profile__color-btn${selectedColor === color.value ? ' new-profile__color-btn--selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                  onClick={() => setSelectedColor(color.value)}
                />
              ))}
            </div>
          </section>

          <button className="new-profile__btn" onClick={handleCreate}>
            Let's Go!
          </button>
          <button
            className="new-profile__back"
            type="button"
            onClick={() => setStep('name')}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
