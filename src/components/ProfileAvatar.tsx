import React from 'react';
import type { Profile } from '../store/profiles';
import './ProfileAvatar.css';

interface Props {
  profile: Profile;
  onClick?: () => void;
  /** 'light' (default) — no border. 'dark' — subtle white border for dark backgrounds. */
  variant?: 'light' | 'dark';
  size?: number;
  className?: string;
}

export function ProfileAvatar({ profile, onClick, variant = 'light', size = 36, className = '' }: Props) {
  const style: React.CSSProperties = {
    backgroundColor: profile.avatarColor,
    width: size,
    height: size,
    fontSize: size * 0.56,
  };

  const cls = [
    'profile-avatar',
    variant === 'dark' ? 'profile-avatar--dark' : '',
    className,
  ].filter(Boolean).join(' ');

  if (onClick) {
    return (
      <button type="button" className={cls} style={style} onClick={onClick} aria-label="Edit profile">
        {profile.avatarEmoji}
      </button>
    );
  }

  return (
    <div className={cls} style={style}>
      {profile.avatarEmoji}
    </div>
  );
}
