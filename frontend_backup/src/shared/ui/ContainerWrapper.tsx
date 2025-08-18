import React from "react";
import { Box, Container, ContainerProps } from "@mui/material";
import { motion } from "framer-motion";

interface ContainerWrapperProps extends Omit<ContainerProps, "children"> {
  children: React.ReactNode;
  fullWidth?: boolean;
  withAnimation?: boolean;
  minHeight?: string | number;
  backgroundColor?: string;
  id?: string;
  fullScreen?: boolean; // Новая опция для полноэкранных секций
}

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

export const ContainerWrapper: React.FC<ContainerWrapperProps> = ({
  children,
  fullWidth = false,
  withAnimation = true,
  minHeight = "100vh",
  backgroundColor = "transparent",
  id,
  maxWidth = "lg",
  fullScreen = false, // Новый параметр
  ...containerProps
}) => {
  const animationProps = withAnimation
    ? {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6 },
      }
    : {};

  // Для полноэкранных секций
  if (fullScreen) {
    return (
      <MotionBox
        id={id}
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor,
          overflow: "hidden",
        }}
        {...animationProps}
      >
        <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
      </MotionBox>
    );
  }

  if (fullWidth) {
    return (
      <MotionBox
        id={id}
        sx={{
          width: "100%",
          minHeight,
          backgroundColor,
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
        {...animationProps}
      >
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 } }}>{children}</Box>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      id={id}
      sx={{
        width: "100%",
        minHeight,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
      {...animationProps}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
        {...containerProps}
      >
        {children}
      </Container>
    </MotionBox>
  );
};

export default ContainerWrapper;
