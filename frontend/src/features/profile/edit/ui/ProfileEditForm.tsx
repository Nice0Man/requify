import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Person as PersonIcon } from '@mui/icons-material';
import { useSnackbar } from '@/shared/ui';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
}

interface ProfileEditFormProps {
  user: User;
  onSave?: (updatedUser: Partial<User>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * ProfileEditForm - форма для редактирования профиля пользователя
 * Позволяет изменить основную информацию профиля
 */
export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    department: user.department || '',
    position: user.position || '',
    bio: user.bio || '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      bio: user.bio || '',
    });
    setAvatarPreview(user.avatar_url || null);
  }, [user]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Avatar file size should not exceed 5MB');
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }

      setAvatarFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updatedData: Partial<User> = {
        ...formData,
      };

      // Если есть новый аватар, добавляем его
      if (avatarFile) {
        // В реальном приложении здесь был бы upload аватара
        // updatedData.avatar_url = await uploadAvatar(avatarFile);
      }

      await onSave?.(updatedData);
      showSuccess('Profile updated successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const firstInitial = formData.first_name.charAt(0);
    const lastInitial = formData.last_name.charAt(0);
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Edit Profile
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <Box display="flex" alignItems="center" mb={3}>
            <Box position="relative">
              <Avatar
                src={avatarPreview || undefined}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 2,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                }}
              >
                {avatarPreview ? null : getInitials() || <PersonIcon />}
              </Avatar>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  color="primary"
                  aria-label="upload avatar"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: 8,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
            
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Profile Photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the camera icon to change your avatar
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form Fields */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                error={!!errors.username}
                helperText={errors.username}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                error={!!errors.first_name}
                helperText={errors.first_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={handleInputChange('department')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={handleInputChange('position')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleInputChange('bio')}
                placeholder="Tell us about yourself..."
              />
            </Grid>
          </Grid>

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={saving || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || loading}
              startIcon={saving ? <CircularProgress size={16} /> : undefined}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 