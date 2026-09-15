import {
    Button,
    ButtonBase,
    Fab,
    FormHelperText,
    Grid,
    Icon,
    IconButton,
    Palette,
    PaletteColor,
    PaletteOptions,
    Paper,
    Snackbar,
    SnackbarContent,
    styled,
} from "@mui/material";
import { FormikProps } from "formik";
import { useEffect, useState } from "react";
import { DropzoneProps, useDropzone } from "react-dropzone";

export interface FilePreview extends File {
    readonly path?: string;
    readonly preview?: string;
}

const FileUploaderContainer = styled("div")(({ theme }) => ({
    flexGrow: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "& .thumbsContainer": {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: theme.spacing(2),
    },
}));

function isImage(file: File) {
    if (file.type.split("/")[0] === "image") {
        return true;
    }

    return false;
}

const DropZoneButton = styled(ButtonBase)(({ theme, color }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
    borderWidth: 2,
    borderRadius: theme.shape.borderRadius * 3,
    borderColor: theme.palette.divider,
    borderStyle: "solid",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.h5.fontSize,
    "& .MuiIcon-root": {
        marginRight: theme.spacing(2),
    },
    "&:hover, &.selected": {
        borderColor: (theme.palette[(color ?? "primary") as keyof PaletteOptions] as PaletteColor).main,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
}));

const Thumb = styled(Paper)(({ theme }) => ({
    display: "inline-flex",
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    width: 100,
    height: 100,
    padding: theme.spacing(1),
    boxSizing: "border-box",
    position: "relative",
    "& .removeButton": {
        transition: ".5s ease",
        position: "absolute",
        opacity: 0,
        top: theme.spacing(-1),
        right: theme.spacing(-1),
        width: 40,
        height: 40,
        "&:hover": {
            opacity: 1,
        },
        zIndex: 10,
    },
    "& .thumbInner": {
        display: "flex",
        minWidth: 0,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        width: "100%",
        "& img": {
            display: "block",
            width: "auto",
            height: "100%",
        },
        "& .MuiIcon-root": {
            fontSize: 48,
        },
        "& span": {
            fontSize: 12,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
            textAlign: "center",
        },
    },
}));

export type FormikFileUploaderProps = {
    icon?: string;
    dropzoneText?: string;
    color?: keyof Palette;
    name: string;
    formik: FormikProps<any>;
    fullWidth?: boolean;
    showPreviews?: boolean;
    showAsButton?: boolean;
} & Omit<DropzoneProps, "onDrop">;

const FormikFileUploader = ({
    name,
    formik,
    icon,
    dropzoneText = "Upload files",
    color,
    fullWidth = false,
    showPreviews = true,
    showAsButton = false,
    ...dropzoneProps
}: FormikFileUploaderProps) => {
    const [snackbarOpen, setSnackbarOpen] = useState({
        open: false,
        message: "",
    });

    const { touched, error, value: files } = formik.getFieldMeta<FilePreview[] | undefined>(name);

    const { setFieldValue, setFieldTouched } = formik;

    const onDropHandle = (acceptedFiles: FilePreview[]) => {
        setFieldValue(name, acceptedFiles, true);

        setFieldTouched(name, true, true);

        const message = acceptedFiles.reduce((acc, file) => `${acc} ${file.name}`, "");

        if (acceptedFiles.length > 0) {
            setSnackbarOpen({
                open: true,
                message: `${message}!`,
            });
        } else {
            const acceptList = dropzoneProps.accept as Record<string, string[]>;
            const accept = Object.keys(acceptList)
                .map((key) => acceptList[key])
                .join(", ");

            setSnackbarOpen({
                open: true,
                message: `ไฟล์ต้องเป็นนามสกุล ${accept} เท่านั้น!`,
            });
        }
    };

    const handleRemove = (index: number) => () => {
        setFieldValue(name, files?.filter((_, i) => i !== index) ?? [], true);
        setFieldTouched(name, true, true);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        ...dropzoneProps,
        onDrop: onDropHandle,
        multiple: dropzoneProps.maxFiles !== 1,
    });

    const thumbs = showPreviews
        ? files?.map((file, index) => (
              <Thumb key={index as number}>
                  <div className="thumbInner">
                      {isImage(file) ? (
                          <img
                              src={URL.createObjectURL(file)}
                              onLoad={() => {
                                  URL.revokeObjectURL(file.preview ?? "");
                              }}
                          />
                      ) : (
                          <>
                              <Icon>insert_drive_file</Icon>
                              <span>{file.path}</span>
                          </>
                      )}
                  </div>
                  <Fab onClick={handleRemove(index)} aria-label="Delete" className="removeButton">
                      <Icon>delete</Icon>
                  </Fab>
              </Thumb>
          ))
        : null;

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files?.forEach((file) => URL.revokeObjectURL(file.preview ?? ""));
    }, [files]);

    return (
        <>
            <FileUploaderContainer color={color} sx={{ width: fullWidth ? "100%" : "unset" }}>
                {!showAsButton ? (
                    <DropZoneButton
                        {...getRootProps({
                            className: `dropzone${isDragActive ? " selected" : ""}`,
                        })}
                        sx={{ width: fullWidth ? "100%" : "unset" }}
                    >
                        <input {...getInputProps()} />
                        {icon && <Icon>{icon}</Icon>}
                        <span>{dropzoneText}</span>
                    </DropZoneButton>
                ) : (
                    <Button
                        variant="contained"
                        startIcon={icon ? <Icon>{icon}</Icon> : null}
                        component="label"
                        sx={{ width: fullWidth ? "100%" : "unset" }}
                        {...getRootProps({})}
                    >
                        {dropzoneText}
                    </Button>
                )}
                {showPreviews && (
                    <Grid container spacing={2} className={"thumbsContainer"}>
                        {thumbs}
                    </Grid>
                )}
                {touched && !!error && <FormHelperText>{error}</FormHelperText>}
            </FileUploaderContainer>
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                autoHideDuration={1500}
                open={snackbarOpen.open}
                onClose={() => setSnackbarOpen({ open: false, message: "" })}
            >
                <SnackbarContent
                    sx={(theme) => ({
                        backgroundColor: theme.palette.success.main,
                    })}
                    message={snackbarOpen.message}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={() => setSnackbarOpen({ open: false, message: "" })}
                        >
                            <Icon fontSize="small">close</Icon>
                        </IconButton>
                    }
                />
            </Snackbar>
        </>
    );
};

export default FormikFileUploader;
