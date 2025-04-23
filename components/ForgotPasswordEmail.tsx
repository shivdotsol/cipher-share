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
    otp: number;
}

export const ForgotPasswordEmail = ({ otp }: OtpEmailProps) => (
    <Html>
        <Head />
        <Preview>One Time Password to reset your CipherShare password.</Preview>
        <Body style={main}>
            <Container style={container}>
                <br />
                <Text style={paragraph}>
                    We noticed a request to reset the login password for the
                    CipherShare account associated with this email.
                    <br />
                    <br />
                    Here is your OTP to reset the password:
                    <strong>{otp}</strong>
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

ForgotPasswordEmail.PreviewProps = {
    firstName: "Shiv",
    otp: 678987,
} as OtpEmailProps;

export default ForgotPasswordEmail;

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
