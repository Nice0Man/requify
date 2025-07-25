import React, { memo } from "react";
import { Card, CardHeader, CardContent, Typography, Grid } from "@mui/material";
import { BarChart as BarChartIcon } from "@mui/icons-material";
import type { ProjectStatsWidgetProps } from "../model/types";

export const ProjectStatsWidget = memo<ProjectStatsWidgetProps>(({
  stats = { total: 0, completed: 0, inProgress: 0 },
  className,
  sx,
  ...props
}) => (
  <Card className={className} sx={sx}>
    <CardHeader avatar={<BarChartIcon />} title="Статистика проектов" />
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography variant="h4">{stats.total}</Typography>
          <Typography variant="body2">Всего</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h4">{stats.completed}</Typography>
          <Typography variant="body2">Завершено</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h4">{stats.inProgress}</Typography>
          <Typography variant="body2">В работе</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
));

ProjectStatsWidget.displayName = "ProjectStatsWidget"; 