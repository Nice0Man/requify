import React, { memo } from "react";
import { Card, CardContent, CardHeader, Typography, Box, Grid } from "@mui/material";
import { ViewColumn as ViewColumnIcon } from "@mui/icons-material";
import type { KanbanWidgetProps } from "../model/types";

export const KanbanWidget = memo<KanbanWidgetProps>(({
  mode = "detailed",
  columns = [],
  onItemMove,
  className,
  sx,
  ...props
}) => {
  return (
    <Card className={className} sx={sx}>
      <CardHeader
        avatar={<ViewColumnIcon />}
        title="Канбан доска"
      />
      <CardContent>
        <Grid container spacing={2}>
          {columns.map((column) => (
            <Grid item xs={12} md={4} key={column.id}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {column.title}
                </Typography>
                {column.items.map((item) => (
                  <Card key={item.id} sx={{ mb: 1, cursor: "pointer" }}>
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="body2">
                        {item.title}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
});

KanbanWidget.displayName = "KanbanWidget"; 