import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, User, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useToast } from '../../hooks/useToast';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface ProfileFormProps {
  initialDisplayName: string;
  onSubmit: (name: string) => Promise<void>;
}

function ProfileForm({ initialDisplayName, onSubmit }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      return;
    }

    setIsSaving(true);
    void onSubmit(displayName.trim())
      .then(() => {
        showSuccess('Profile updated successfully');
      })
      .catch(() => {
        showError('Failed to update profile');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving || !displayName.trim()}
          className="px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, updateDisplayName, updateAvatar, removeAvatar } = useProfile();
  const { showSuccess, showError } = useToast();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError('Please upload a JPG, PNG, GIF, or WebP image');
      return;
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      showError('Image must be less than 2MB');
      return;
    }

    setIsUploadingAvatar(true);
    void updateAvatar(file)
      .then(() => {
        showSuccess('Avatar updated successfully');
      })
      .catch(() => {
        showError('Failed to upload avatar');
      })
      .finally(() => {
        setIsUploadingAvatar(false);
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const handleRemoveAvatar = () => {
    setIsUploadingAvatar(true);
    void removeAvatar()
      .then(() => {
        showSuccess('Avatar removed');
      })
      .catch(() => {
        showError('Failed to remove avatar');
      })
      .finally(() => {
        setIsUploadingAvatar(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to templates
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          {/* Avatar Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Profile Photo
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Camera size={16} />
                  Change photo
                </button>
                {profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG, GIF, or WebP. Max 2MB.
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {!profile && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              <AlertCircle size={18} />
              Profile will be created when you save
            </div>
          )}

          {/* Profile Form with key to reset state when profile changes */}
          <ProfileForm
            key={profile?.id ?? 'new'}
            initialDisplayName={profile?.display_name ?? ''}
            onSubmit={updateDisplayName}
          />
        </div>
      </div>
    </div>
  );
}
