import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AVATAR_EMOJIS, AVATAR_COLORS } from '../store/profiles';

const PASTEL_COLORS  = AVATAR_COLORS.slice(0, 8);
const VIBRANT_COLORS = AVATAR_COLORS.slice(8);
import { useProfile } from '../context/ProfileContext';
import './NewProfileView.css';

export function EditProfileView() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { profiles, updateProfile, removeProfile, isLoaded } = useProfile();

  const profile = profiles.find(p => p.id === profileId);

  const [form, setForm] = useState<{ name: string; emoji: string; color: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Don't set form state until the profile is available — avoids a flash of
  // default values on hard refresh while context loads from localStorage.
  React.useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, emoji: profile.avatarEmoji, color: profile.avatarColor });
    }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoaded && !profile) {
    navigate('/');
    return null;
  }

  // Render nothing until the effect has populated form state.
  if (!form) return null;

  const setName  = (name: string)  => setForm(f => f ? { ...f, name }  : f);
  const setEmoji = (emoji: string) => setForm(f => f ? { ...f, emoji } : f);
  const setColor = (color: string) => setForm(f => f ? { ...f, color } : f);

  async function handleSave() {
    if (!profileId || form.name.trim().length < 1) return;
    await updateProfile(profileId, {
      name: form.name.trim(),
      avatarEmoji: form.emoji,
      avatarColor: form.color,
    });
    navigate('/');
  }

  return (
    <div className="new-profile">
      <div className="new-profile__step">
        <h1 className="new-profile__title">Edit profile</h1>

        <div
          className="new-profile__preview"
          style={{ backgroundColor: form.color }}
        >
          {form.emoji}
        </div>

        <section className="new-profile__section">
          <h2 className="new-profile__section-label">Name</h2>
          <input
            className="new-profile__name-input"
            type="text"
            value={form.name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
        </section>

        <section className="new-profile__section">
          <h2 className="new-profile__section-label">Character</h2>
          <div className="new-profile__emoji-grid">
            {AVATAR_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={`new-profile__emoji-btn${form.emoji === emoji ? ' new-profile__emoji-btn--selected' : ''}`}
                onClick={() => setEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>

        <section className="new-profile__section">
          <h2 className="new-profile__section-label">Color</h2>
          <div className="new-profile__color-grid">
            {PASTEL_COLORS.map(color => (
              <button
                key={color.value}
                type="button"
                className={`new-profile__color-btn${form.color === color.value ? ' new-profile__color-btn--selected' : ''}`}
                style={{ backgroundColor: color.value }}
                aria-label={color.label}
                onClick={() => setColor(color.value)}
              />
            ))}
          </div>
          <div className="new-profile__color-grid">
            {VIBRANT_COLORS.map(color => (
              <button
                key={color.value}
                type="button"
                className={`new-profile__color-btn${form.color === color.value ? ' new-profile__color-btn--selected' : ''}`}
                style={{ backgroundColor: color.value }}
                aria-label={color.label}
                onClick={() => setColor(color.value)}
              />
            ))}
          </div>
        </section>

        <button
          className="new-profile__btn"
          onClick={handleSave}
          disabled={form.name.trim().length < 1}
        >
          Save
        </button>
        <button
          className="new-profile__back"
          type="button"
          onClick={() => navigate('/')}
        >
          Cancel
        </button>

        <div className="edit-profile__delete-zone">
          {!confirmingDelete ? (
            <button
              className="edit-profile__delete-btn"
              type="button"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete profile
            </button>
          ) : (
            <div className="edit-profile__confirm">
              <span className="edit-profile__confirm-text">Type DELETE to confirm</span>
              <input
                className="edit-profile__delete-input"
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                autoFocus
              />
              <div className="edit-profile__confirm-actions">
                <button
                  className="edit-profile__confirm-yes"
                  type="button"
                  disabled={deleteInput !== 'DELETE'}
                  onClick={async () => { await removeProfile(profileId!); navigate('/'); }}
                >
                  Delete
                </button>
                <button
                  className="edit-profile__confirm-no"
                  type="button"
                  onClick={() => { setConfirmingDelete(false); setDeleteInput(''); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
