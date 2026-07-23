import axios from "axios";
import { OCR_API_URL } from "../../Const";

export const uploadIDCard = async (projectId: number, file: File) => {
    const form = new FormData();
    form.append("project_id", String(projectId));
    form.append("file", file);

    const { data } = await axios.post(`${OCR_API_URL}/v1/upload/id-card`, form);

    return data;
};

export const uploadReceipt = async (projectId: number, file: File) => {
    const form = new FormData();
    form.append("project_id", String(projectId));
    form.append("file", file);

    const { data } = await axios.post(`${OCR_API_URL}/v1/upload/receipt`, form);

    return data;
};

export const uploadMedicalCertificate = async (projectId: number, file: File) => {
    const form = new FormData();
    form.append("project_id", String(projectId));
    form.append("file", file);

    const { data } = await axios.post(`${OCR_API_URL}/v1/upload/medical-certificate`, form);

    return data;
};

export const uploadPassport = async (projectId: number, file: File) => {
    const form = new FormData();
    form.append("project_id", String(projectId));
    form.append("file", file);

    const { data } = await axios.post(`${OCR_API_URL}/v1/upload/passport`, form);

    return data;
};

export const uploadAlienCard = async (projectId: number, file: File) => {
    const form = new FormData();
    form.append("project_id", String(projectId));
    form.append("file", file);

    const { data } = await axios.post(`${OCR_API_URL}/v1/upload/alien-card`, form);

    return data;
};
