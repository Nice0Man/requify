import React from "react";
import { Box, Container, ContainerProps } from "@mui/material";
import { motion, Transition, Easing } from "framer-motion";

interface ContainerWrapperProps extends Omit<ContainerProps, "children"> {
  children: React.ReactNode;
  fullWidth?: boolean;
  withAnimation?: boolean;
  minHeight?: string | number;
  backgroundColor?: string;
  id?: string;
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
  ...containerProps
}) => {
  const animationProps = withAnimation
    ? {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: {
          duration: 0.6,
          ease: "easeOut" as Easing,
        } as Transition,
      }
    : {};

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
