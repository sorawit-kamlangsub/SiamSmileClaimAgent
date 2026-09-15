import React from "react";

type BlankPageProps = {
    title?: string;
    body?: string | React.ReactNode;
};

const BlankPage = ({ title, body = "Blank Page" }: BlankPageProps) => {
    return (
        <>
            {!!title && <h1>{title}</h1>}
            <div>{body}</div>
        </>
    );
};

export default BlankPage;
