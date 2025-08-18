import React, { memo } from "react";
import { Card, CardHeader, CardContent, List, ListItem, ListItemText } from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import type { RequirementListWidgetProps } from "../model/types";

export const RequirementListWidget = memo<RequirementListWidgetProps>(({
  requirements = [],
  className,
  sx,
  ...props
}) => (
  <Card className={className} sx={sx}>
    <CardHeader avatar={<AssignmentIcon />} title="Требования" />
    <CardContent>
      <List>
        {requirements.map((req) => (
          <ListItem key={req.id}>
            <ListItemText primary={req.title} secondary={req.status} />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
));

RequirementListWidget.displayName = "RequirementListWidget"; 