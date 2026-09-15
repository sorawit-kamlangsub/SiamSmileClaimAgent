import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { styled, useTheme } from "@mui/material";
import { Link, LinkProps } from "react-router-dom";

const StyledLink = styled(Link)({
    textDecoration: "inherit",
});

type ExternalLinkProps = {
    children?: string;
} & LinkProps;

const ExternalLink = ({ children, ...linkProps }: ExternalLinkProps) => {
    const theme = useTheme();

    return (
        <StyledLink {...linkProps}>
            {children}
            <FontAwesomeIcon icon="external-link-alt" style={{ marginLeft: theme.spacing(0.5) }} />
        </StyledLink>
    );
};

export default ExternalLink;
