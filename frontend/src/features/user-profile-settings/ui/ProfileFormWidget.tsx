/**
 * Profile Form Widget Component
 */

import React from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Badge,
  IconButton,
  Typography,
  Paper,
  Stack,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useProfileForm } from "../hooks/useProfileForm";

interface ProfileFormWidgetProps {
  onSave?: () => void;
  showActions?: boolean;
}

export const ProfileFormWidget: React.FC<ProfileFormWidgetProps> = ({
  onSave,
  showActions = true,
}) => {
  const theme = useTheme();
  const {
    data,
    isLoading,
    isSaving,
    errors,
    isDirty,
    updateField,
    uploadAvatar,
    saveProfile,
  } = useProfileForm();

  const handleSave = async () => {
    const result = await saveProfile();
    if (result.success && onSave) {
      onSave();
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Загрузка данных профиля...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Avatar Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          textAlign: "center",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <IconButton
              size="small"
              component="label"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                width: 32,
                height: 32,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </IconButton>
          }
        >
          <Avatar
            src={data.avatar_url}
            sx={{
              width: 120,
              height: 120,
              backgroundColor: theme.palette.primary.main,
              fontSize: "3rem",
              fontWeight: 700,
              border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {data.firstName[0]}{data.lastName[0]}
          </Avatar>
        </Badge>

        {errors.avatar && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.avatar}
          </Alert>
        )}
      </Paper>

      {/* Form Fields */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Имя"
            value={data.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Фамилия"
            value={data.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Телефон"
            value={data.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Должность"
            value={data.position || ""}
            onChange={(e) => updateField("position", e.target.value)}
            InputProps={{
              startAdornment: <WorkIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="О себе"
            multiline
            rows={3}
            value={data.bio || ""}
            onChange={(e) => updateField("bio", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Grid>
      </Grid>

      {/* General Error */}
      {errors.general && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {errors.general}
        </Alert>
      )}

      {/* Actions */}
      {showActions && (
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
            }}
          >
            {isSaving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </Stack>
      )}
    </Box>
  );
}; 