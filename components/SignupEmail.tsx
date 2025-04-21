import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Preview,
    Text,
} from "@react-email/components";
import * as React from "react";

interface OtpEmailProps {
    firstName: string;
    otp: number;
}

export const OtpEmail = ({ firstName, otp }: OtpEmailProps) => (
    <Html>
        <Head />
        <Preview>
            The file sharing platform that's truly end-to-end encrypted.
        </Preview>
        <Body style={main}>
            <Container style={container}>
                <br />
                <Text style={paragraph}>Hi {firstName},</Text>
                <Text style={paragraph}>
                    Welcome to CipherShare, The file sharing platform that's
                    truly end-to-end encrypted.
                    <br />
                    <br />
                    Here is your one time password: <strong>{otp}</strong>
                    <br />
                    <br />
                </Text>
                <Text style={paragraph}>
                    Best,
                    <br />
                    The CipherShare team
                </Text>
                <Hr style={hr} />
                <Text style={footer}>
                    1283 C Block Rajajipuram Lucknow India 226017
                </Text>
            </Container>
        </Body>
    </Html>
);

OtpEmail.PreviewProps = {
    firstName: "Shiv",
    otp: 678987,
} as OtpEmailProps;

export default OtpEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
};

const logo = {
    margin: "0 auto",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
};

const btnContainer = {
    textAlign: "center" as const,
};

const button = {
    backgroundColor: "#5F51E8",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px",
};

const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
};
