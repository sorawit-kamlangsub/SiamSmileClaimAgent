import { Box, ButtonBase, Typography } from "@mui/material";

export interface StepDef {
    label: string;
}

export interface StepToggleBarProps {
    steps: StepDef[];
    activeStep: number; // 0-based index
    onStepChange: (stepIndex: number) => void;
    /**
     * Optional guard — return false to block navigating to that step
     * (e.g. block step 2/3 until step 1 is valid). Defaults to allowing
     * any step that is <= the furthest one already reached, i.e. no
     * jumping ahead, but free navigation backward.
     */
    isStepClickable?: (stepIndex: number) => boolean;
}

const StepToggleBar = ({ steps, activeStep, onStepChange, isStepClickable }: StepToggleBarProps) => {
    const canClick = (index: number) => (isStepClickable ? isStepClickable(index) : index <= activeStep);

    return (
        <Box
            data-step-toggle-bar
            sx={{
                display: "flex",
                backgroundColor: "#EDF1F5",
                borderRadius: "10px",
                padding: "6px",
                gap: "4px",
                scrollMarginTop: "100px",
            }}
        >
            {steps.map((step, index) => {
                const isActive = index === activeStep;
                const clickable = canClick(index);
                // ความเข้ม/จางของสี บอก "ผ่าน step นี้มาหรือยัง" ล้วน ๆ ไม่เกี่ยวกับกดได้/กดไม่ได้ —
                // แยกออกจาก clickable เพื่อไม่ให้ step ปัจจุบัน/ที่ผ่านมาแล้วดูจางไปตอนปิดการคลิกทั้งแถบ
                const isReached = index <= activeStep;

                return (
                    <ButtonBase
                        key={step.label}
                        data-step-index={index}
                        aria-current={isActive ? "step" : undefined}
                        disabled={!clickable}
                        onClick={() => onStepChange(index)}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            cursor: clickable ? "pointer" : "default",
                            backgroundColor: isActive ? "#FFFFFF" : "transparent",
                            border: isActive ? "1px solid #90CAF9" : "1px solid transparent",
                            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            opacity: isReached ? 1 : 0.6,
                            transition: "all 0.15s ease",
                        }}
                    >
                        <Box
                            sx={{
                                width: 26,
                                height: 26,
                                minWidth: 26,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isActive ? "#1565C0" : "#B0BEC5",
                                color: "#FFFFFF",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                            }}
                        >
                            {index + 1}
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#1565C0" : "#78909C",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {step.label}
                        </Typography>
                    </ButtonBase>
                );
            })}
        </Box>
    );
};

export default StepToggleBar;
