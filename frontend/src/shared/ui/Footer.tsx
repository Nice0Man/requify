import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Twitter,
  Email,
  Phone,
  LocationOn,
  Business,
  Security,
  Help,
  Info,
  Policy,
  Gavel,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <GitHub />, href: '#', label: 'GitHub' },
    { icon: <LinkedIn />, href: '#', label: 'LinkedIn' },
    { icon: <Twitter />, href: '#', label: 'Twitter' },
  ];

  const quickLinks = [
    { title: 'О системе', href: '/about', icon: <Info /> },
    { title: 'Документация', href: '/docs', icon: <Help /> },
    { title: 'API', href: '/api-overview', icon: <Business /> },
    { title: 'Безопасность', href: '/security', icon: <Security /> },
  ];

  const legalLinks = [
    { title: 'Политика конфиденциальности', href: '/privacy', icon: <Policy /> },
    { title: 'Условия использования', href: '/terms', icon: <Gavel /> },
    { title: 'Лицензия', href: '/license', icon: <Business /> },
  ];

  const contactInfo = [
    { icon: <Email />, text: 'support@requify.com', href: 'mailto:support@requify.com' },
    { icon: <Phone />, text: '+7 (495) 123-45-67', href: 'tel:+74951234567' },
    { icon: <LocationOn />, text: 'Москва, Россия', href: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Основная информация */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Requify
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Профессиональная система управления требованиями для команд разработки.
              Упрощаем процесс создания, отслеживания и управления требованиями к программному обеспечению.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Быстрые ссылки */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Продукт
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {React.cloneElement(link.icon, { fontSize: 'small' })}
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Правовая информация */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Правовая информация
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {legalLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {React.cloneElement(link.icon, { fontSize: 'small' })}
                  {link.title}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Контактная информация */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Контакты
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {contactInfo.map((contact, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary',
                  }}
                >
                  {React.cloneElement(contact.icon, { fontSize: 'small' })}
                  {contact.href.startsWith('mailto:') || contact.href.startsWith('tel:') ? (
                    <Link
                      href={contact.href}
                      color="inherit"
                      underline="hover"
                      sx={{
                        fontSize: '0.875rem',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {contact.text}
                    </Link>
                  ) : (
                    <Typography variant="body2" color="inherit">
                      {contact.text}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {/* Дополнительная информация */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Техническая поддержка: 24/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Время ответа: до 2 часов
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Нижняя часть */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Requify. Все права защищены.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Версия: 1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Статус: Активная
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'success.main',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              <Typography variant="body2" color="inherit">
                Все системы работают
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 