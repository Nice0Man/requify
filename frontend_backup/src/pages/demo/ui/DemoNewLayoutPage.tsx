import { memo } from "react";
import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";

// Это демонстрационная страница, показывающая как использовать новый layout
// ВАЖНО: Страница теперь содержит ТОЛЬКО свой контент
// ProtectedLayout автоматически добавляет SidebarWidget + AppHeaderWidget

/**
 * Демонстрационная страница с новым layout подходом
 *
 * СТАРЫЙ ПОДХОД (НЕ ИСПОЛЬЗУЙТЕ):
 * ```tsx
 * return (
 *   <PageLayout title="..." sidebar={<SidebarWidget />} header={<AppHeaderWidget />}>
 *     // контент страницы
 *   </PageLayout>
 * );
 * ```
 *
 * НОВЫЙ ПОДХОД (ИСПОЛЬЗУЙТЕ):
 * ```tsx
 * // ProtectedLayout автоматически добавляется в router
 * return (
 *   // Только контент страницы, никаких layout компонентов!
 *   <Grid container spacing={3}>
 *     // ваш контент здесь
 *   </Grid>
 * );
 * ```
 */
export const DemoNewLayoutPage = memo(() => {
  // ВАЖНО: Возвращаем ТОЛЬКО контент страницы
  // Sidebar, Header, и остальной layout добавляется автоматически через ProtectedLayout
  return (
    <>
      {/* Информационный баннер */}
      <Box sx={{ mb: 3 }}>
        <Card sx={{ bgcolor: "info.light", color: "info.contrastText" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DashboardIcon />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Новая архитектура layout'а
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Эта страница демонстрирует новый подход с автоматической
                  интеграцией SidebarWidget
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Основной контент страницы */}
      <Grid container spacing={3}>
        {/* Карточка с особенностями */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ✨ Особенности нового layout
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="✅" color="success" size="small" />
                  <Typography variant="body2">
                    Автоматическая интеграция SidebarWidget
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="✅" color="success" size="small" />
                  <Typography variant="body2">
                    Collapsed по умолчанию (экономия места)
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="✅" color="success" size="small" />
                  <Typography variant="body2">
                    DnD на Long Click (800ms)
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="✅" color="success" size="small" />
                  <Typography variant="body2">
                    Admin маршруты (только для админов)
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="✅" color="success" size="small" />
                  <Typography variant="body2">
                    User Profile внизу sidebar
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Карточка с инструкциями */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                📝 Как обновить существующие страницы
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                1. Удалите импорты PageLayout, SidebarWidget, AppHeaderWidget
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                2. Уберите обертку PageLayout из return'а
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                3. Оставьте только контент страницы
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                4. ProtectedLayout автоматически добавится через router
              </Typography>

              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  💡 Совет: Заголовки страниц теперь определяются автоматически
                  из пути
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Дополнительные демо карточки */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                Статистика 1
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Активных пользователей
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="secondary" sx={{ mb: 1 }}>
                Статистика 2
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Проектов в работе
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Статистика 3
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                89%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Успешных релизов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
});

DemoNewLayoutPage.displayName = "DemoNewLayoutPage";

// Добавляем default export для React.lazy()
export default DemoNewLayoutPage;
