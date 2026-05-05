import { Box } from "@mui/material";
import { PageWrapper } from "../modules/_auth";

const Home = () => {
    return (
        <PageWrapper title="หน้าแรก">
            <Box sx={{ minHeight: "calc(100vh - 260px)" }}>
                <h2>วิธีการใช้งาน</h2>
                <ol>
                    <li>
                        สร้างไฟล์ <code>`.env.local`</code>
                    </li>
                    <li>
                        ใช้คำสั่ง <code>`npm install`</code> เพื่อติดตั้ง dependencies
                    </li>
                    <li>
                        ใช้คำสั่ง <code>`npm start`</code> เพื่อรัน Template
                    </li>
                </ol>
            </Box>
        </PageWrapper>
    );
};

export default Home;
