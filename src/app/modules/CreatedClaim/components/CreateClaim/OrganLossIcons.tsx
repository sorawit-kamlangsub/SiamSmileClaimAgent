import React from "react";
import { SvgIconProps } from "@mui/material/SvgIcon";
import BackHandIcon from "@mui/icons-material/BackHand";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HearingIcon from "@mui/icons-material/HearingOutlined";
import DirectionsWalkOutlinedIcon from "@mui/icons-material/DirectionsWalkOutlined";
import AccessibleIcon from "@mui/icons-material/AccessibleOutlined";
import PaymentsIcon from "@mui/icons-material/Payments";
import { faShoePrints } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OrganIconKey } from "../../hooks/CreateClaim/organLoss.types";

const ShoePrintsIcon: React.FC<SvgIconProps> = ({ sx, className }) => {
    const style = sx as React.CSSProperties;
    return (
        <span
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <FontAwesomeIcon
                icon={faShoePrints}
                rotation={270}
                style={{
                    fontSize: style?.fontSize,
                    color: style?.color,
                }}
            />
        </span>
    );
};

export const ORGAN_ICON_MAP: Record<OrganIconKey, React.ComponentType<SvgIconProps>> = {
    hand: BackHandIcon,
    foot: ShoePrintsIcon,
    eye: VisibilityIcon,
    ear: HearingIcon,
    finger: BackHandIcon,
    walk: DirectionsWalkOutlinedIcon,
    wheelchair: AccessibleIcon,
    payment: PaymentsIcon,
};
