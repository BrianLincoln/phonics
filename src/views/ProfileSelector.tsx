import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import './ProfileSelector.css';

export function ProfileSelector() {
  const { profiles, selectProfile } = useProfile();
  const navigate = useNavigate();

  function handleSelect(profile: (typeof profiles)[0]) {
    selectProfile(profile);
    navigate('/map');
  }

  return (
    <div className="profile-selector">
      <div className="profile-selector__header">
        <h1 className="profile-selector__title">Time to Read!</h1>
        <p className="profile-selector__subtitle">Who's playing today?</p>
      </div>

      <div className="profile-selector__grid">
        {profiles.map(profile => (
          <div key={profile.id} className="profile-card-wrapper">
            <button
              className="profile-card"
              onClick={() => handleSelect(profile)}
            >
              <div
                className="profile-card__avatar"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {profile.avatarEmoji}
              </div>
              <span className="profile-card__name">{profile.name}</span>
            </button>
            <button
              className="profile-card__edit"
              aria-label={`Edit ${profile.name}`}
              onClick={() => navigate(`/edit-profile/${profile.id}`)}
            >
              ✏️
            </button>
          </div>
        ))}

        <button
          className="profile-card profile-card--add"
          onClick={() => navigate('/new-profile')}
        >
          <div className="profile-card__avatar profile-card__avatar--add">+</div>
          <span className="profile-card__name">Add Learner</span>
        </button>
      </div>
    </div>
  );
}
